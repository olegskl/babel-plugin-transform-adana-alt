import {types as t} from 'babel-core';
import {createMarker, markAsInstrumented, isInstrumented} from './marker';
import {
  instrumentBlock,
  instrumentStatement,
  instrumentExpression,
  instrumentObjectProperty,
  instrumentClassProperty,
  isInstrumentableStatement
} from './instrumenters';

function safeguardVisitor(visitor) {
  return function visitorProxy(path, state) {
    if (path.node && path.node.loc && !isInstrumented(path)) {
      markAsInstrumented(path); // ensure path is visited only once
      visitor(path, state); // visitors don't return
    }
  };
}

function safeguardVisitors(visitors) {
  Object.keys(visitors).forEach(key => {
    visitors[key] = safeguardVisitor(visitors[key]);
  });
  return visitors;
}

export default safeguardVisitors({

  // Source: 'ngInject';
  // Instrumented: 'ngInject'; _increment(0);
  Directive(path, state) {
    const loc = path.node.loc;
    const marker = createMarker(state, {loc, tags: ['statement', 'directive']});
    path.insertAfter(markAsInstrumented(
      t.expressionStatement(marker)
    ));
  },

  // BlockStatement: instrumentBlock,
  Statement: instrumentStatement,

  Expression(path, state) {
    // Don't instrument super:
    if (path.isSuper()) { return; }
    instrumentExpression(path, state);
  },

  // Source: ++a;
  // Instrumented: ++count, ++a;
  UpdateExpression(path, state) {
    markAsInstrumented(path.get('argument'));
    instrumentExpression(path, state);
  },

  MemberExpression(path, state) {
    if (path.node.computed) { return; }
    const oldProp = path.get('property');
    const newProp = t.stringLiteral(oldProp.node.name);
    newProp.loc = oldProp.node.loc;
    path.node.computed = true;
    oldProp.replaceWith(markAsInstrumented(newProp));
    instrumentExpression(path.get('property'), state);
  },

  ImportDeclaration(path, state) {
    // Source is not instrumentable:
    markAsInstrumented(path.get('source'));
    instrumentStatement(path, state, ['import', 'statement']);
  },

  // Source: export {};
  // Instrumented: ++count; export {};
  ExportDeclaration(path, state) {
    instrumentStatement(path, state, ['export', 'statement']);
  },

  // Source: const a = 'a';
  // Instrumented: ++count; const a = 'a';
  VariableDeclaration(path, state) {
    instrumentStatement(path, state, ['variable', 'statement']);
  },

  // Source: false || true
  // Instrumented: (++count, false) || (++count, true)
  LogicalExpression(path, state) {
    instrumentExpression(path.get('left'), state, ['branch']);
    instrumentExpression(path.get('right'), state, ['branch']);
    instrumentExpression(path, state);
  },

  // Source: true ? 1 : 2
  // Instrumented: ++count, (++count, true) ? (++count, 1) : (++count, 2)
  ConditionalExpression(path, state) {
    instrumentExpression(path.get('consequent'), state, ['branch']);
    instrumentExpression(path.get('alternate'), state, ['branch']);
    instrumentExpression(path, state);
  },

  // Source: if (true) {}
  // Instrumented: ++count; if (++count, true) { ++count; } else { ++count; }
  IfStatement(path, state) {
    // There is always a "consequent" branch:
    instrumentBlock('body', path.get('consequent'), state, ['branch']);

    // An "alternate" branch may exist:
    const alternate = path.get('alternate');
    if (alternate.isBlockStatement()) {
      instrumentBlock('body', path.get('alternate'), state, ['branch']);
    } else if (!alternate.isIfStatement()) {
      const body = t.blockStatement([]);
      const locEnd = path.node.loc.end;
      body.loc = {start: locEnd, end: locEnd};
      alternate.replaceWith(body);
      instrumentBlock('body', alternate, state, ['branch']);
    }

    // We want to instrument entire if-statements as statements:
    if (path.key !== 'alternate') {
      instrumentStatement(path, state);
    }
  },

  // Source: case 'a':
  // Instrumented: case (++count, 'a'): ++count;
  SwitchCase(path, state) {
    instrumentBlock('consequent', path, state, ['branch']);
  },

  // Source: try {} finally {}
  // Instrumented: try { ++count; } finally { ++count; }
  TryStatement(path, state) {
    instrumentBlock('body', path.get('block'), state, ['branch']);
    if (path.has('finalizer')) {
      instrumentBlock('body', path.get('finalizer'), state, ['branch']);
    }
    instrumentStatement(path, state);
  },

  // Source: catch (err) {}
  // Instrumented: catch (err) { ++count; }
  CatchClause(path, state) {
    instrumentBlock('body', path.get('body'), state, ['branch']);
  },

  // Source: do {} while (cond);
  // instrumented: ++count; do {} while (++count, cond);
  DoWhileStatement(path, state) {
    instrumentBlock('body', path.get('body'), state, ['branch']);
    instrumentStatement(path, state);
  },

  // Source: while (cond) {}
  // instrumented: ++count; while (cond) { ++count }
  WhileStatement(path, state) {
    instrumentBlock('body', path.get('body'), state, ['branch']);
    instrumentStatement(path, state);
  },

  Function(path, state) {
    if (path.node.kind === 'constructor') {
      instrumentBlock('body', path.get('body'), state, ['function', '_constructor']);
    } else {
      instrumentBlock('body', path.get('body'), state, ['function']);
    }
    instrumentStatement(path, state);
  },

  // Source: x => {}
  // Instrumented: x => { ++count; }
  // Source: x => x
  // Instrumented: x => ++count, x
  ArrowFunctionExpression(path, state) {
    const body = path.get('body');
    if (body.isBlockStatement()) {
      instrumentBlock('body', body, state, ['function']);
    } else {
      instrumentExpression(body, state, ['function', 'expression']);
    }
  },

  // Source: {a: 'b'}
  // Instrumented: {a: (++count, 'b')}
  ObjectProperty(path, state) {
    if (path.parentPath.isPattern()) {
      markAsInstrumented(path.get('value'));
      return;
    }
    instrumentObjectProperty(path, state);
  },

  // Source: {['a'](){}}
  // Instrumented: {[_increment(0, 'a')]: _increment(1, function a() { _increment(2); })}
  // Source: {a(){}}
  // Instrumented: {[_increment(3, 'a')]() { _increment(2); }}
  ObjectMethod(path, state) {
    instrumentBlock('body', path.get('body'), state, ['function']);
    instrumentObjectProperty(path, state);
  },

  ClassBody(path, state) {
    const parent = path.parentPath;
    const body = path.get('body');
    const methods = body.filter(node => node.isMethod());
    const props = body.filter(node => !node.isMethod());
    const methodMarkers = methods.map(method => {
      const tags = ['statement', 'method'];
      const loc = method.node.loc;
      return createMarker(state, {loc, tags});
    });

    if (parent.isStatement()) {
      const instrumentableParent = path.findParent(isInstrumentableStatement);
      methodMarkers.forEach(marker => {
        instrumentableParent.insertBefore(markAsInstrumented(
          t.expressionStatement(marker)
        ));
      });
    } else if (parent.isExpression()) {
      parent.replaceWith(markAsInstrumented(
        t.sequenceExpression([...methodMarkers, parent.node])
      ));
    }

    props.forEach(prop => {
      instrumentClassProperty(prop, state);
    });
  }

});
