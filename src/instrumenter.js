import {util} from 'babel-core';
import hash from './hash';
import uid from './uid';
import {getCoverageMeta, setCoverageMeta} from './meta';
import {markAsIgnored, isMarkedAsIgnored} from './mark';
// import reserved from './reserved';

function shouldSkipFile({opts, file} = {}) {
  if (!file || !opts) { return false; }
  const {ignore = [], only} = opts;
  return util.shouldIgnore(
    file.opts.filename,
    util.arrayify(ignore, util.regexify),
    only ? util.arrayify(only, util.regexify) : null
  );
}

function safeguardVisitor(visitor) {
  return function visitorProxy(path, state) {
    if (path.node && path.node.loc && !isMarkedAsIgnored(path.node)) {
      markAsIgnored(path.node); // ensure path is visited only once
      visitor(path, state); // visitors don't return
    }
  };
}

export default function instrumenter({types: t}) {

  function createMarker(state, {loc, tags}) {
    const {locations, variable} = getCoverageMeta(state);
    const id = locations.length;
    locations.push({id, loc, tags, count: 0});
    return markAsIgnored(t.unaryExpression('++', t.memberExpression(
      t.memberExpression(variable, t.numericLiteral(id), true),
      t.identifier('count')
    )));
  }

  // 42 ---> (++_counter[id].count, 42)
  function instrumentExpression(path, state, tags = ['expression']) {
    const isEmptyNode = !path.node;
    const loc = isEmptyNode ? path.parent.loc : path.node.loc;
    const marker = createMarker(state, {loc, tags});
    const node = isEmptyNode ? t.identifier('undefined') : path.node;
    path.replaceWith(markAsIgnored(
      t.sequenceExpression([marker, markAsIgnored(node)])
    ));
  }

  // break; ---> ++_ankaracoverage[0].count; break;
  function instrumentStatement(path, state, tags = ['statement']) {
    const loc = path.node.loc;
    const marker = createMarker(state, {loc, tags});
    path.insertBefore(markAsIgnored(
      t.expressionStatement(marker)
    ));
  }

  // {} ---> { ++_ankaracoverage[0].count; }
  function instrumentBlock(container, path, state, tags) {
    const loc = path.node.loc;
    const marker = createMarker(state, {loc, tags});
    path.unshiftContainer(container, markAsIgnored(
      t.expressionStatement(marker)
    ));
  }

  const visitor = {
    Directive(path, state) {
      // Source: 'ngInject';
      // Instrumented: 'ngInject'; ++count;
      const loc = path.node.loc;
      const marker = createMarker(state, {loc, tags: ['statement', 'directive']});
      path.parentPath.unshiftContainer('body', markAsIgnored(
        t.expressionStatement(marker)
      ));
    },
    ExpressionStatement: {
      // Source: 42;
      // Instrumented: ++count; 42;
      exit: instrumentStatement
    },
    CallExpression: { // FIXME
      // Source: foo()
      // Instrumented: ++count, foo()
      exit(path, state) {
        path.get('arguments').forEach(a => {
          if (a.isExpression()) {
            instrumentExpression(a, state);
          }
        });
        if (!isMarkedAsIgnored(path)) {
          instrumentExpression(path, state);
        }
      }
    },
    MemberExpression: {
      // Source: a().then();
      // Instrumented: a()[(++count, 'then')]();
      exit(path, state) {
        if (path.node.computed) {
          instrumentExpression(path.get('property'), state);
        } else {
          const oldProp = path.get('property');
          const newPropName = oldProp.node.name;
          const newProp = t.stringLiteral(newPropName);
          newProp.loc = oldProp.node.loc;
          path.node.computed = true;
          oldProp.replaceWith(newProp);
          instrumentExpression(path.get('property'), state);
        }
      }
    },
    UpdateExpression: {
      // Source: ++a;
      // Instrumented: ++count; ++count, ++a;
      exit: instrumentExpression
    },
    AssignmentExpression: {
      // Source: a += 1
      // Instrumented: a += (++count, 1)
      exit(path, state) {
        if (isMarkedAsIgnored(path.get('right'))) { return; }
        instrumentExpression(path.get('right'), state);
      }
    },
    BinaryExpression: {
      // Source: true === true
      // Instrumented: (++count, true) === (++count, true)
      exit(path, state) {
        instrumentExpression(path.get('left'), state);
        instrumentExpression(path.get('right'), state);
      }
    },
    LogicalExpression: {
      // Source: false || true
      // Instrumented: (++count, false) || (++count, true)
      exit(path, state) {
        instrumentExpression(path.get('left'), state, ['branch', 'expression']);
        instrumentExpression(path.get('right'), state, ['branch', 'expression']);
      }
    },
    TryStatement: {
      // Source: try {} finally {}
      // Instrumented: try { ++count; } finally { ++count; }
      exit(path, state) {
        instrumentBlock('body', path.get('block'), state, ['branch']);
        if (path.has('finalizer')) {
          instrumentBlock('body', path.get('finalizer'), state, ['branch']);
        }
        instrumentStatement(path, state);
      }
    },
    CatchClause: {
      // Source: catch (err) {}
      // Instrumented: catch (err) { ++count; }
      exit(path, state) {
        instrumentBlock('body', path.get('body'), state, ['branch']);
      }
    },
    ThrowStatement: {
      // Source: throw 'err';
      // Instrumented: ++count; throw ++count, 'err';
      exit(path, state) {
        instrumentExpression(path.get('argument'), state);
        instrumentStatement(path, state);
      }
    },
    BreakStatement: {
      exit: instrumentStatement
    },
    ContinueStatement: {
      exit: instrumentStatement
    },
    VariableDeclaration: {
      exit(path, state) {
        // Source: const a = 'a';
        // Instrumented: ++count; const a = 'a';
        instrumentStatement(path, state, [
          'variable',
          'statement'
        ]);
      }
    },
    VariableDeclarator: {
      exit(path, state) {
        // Source: let a = 42, b = 43;
        // Instrumented: let a = (++count, 42), b = (++count, 43);
        if (isMarkedAsIgnored(path.get('init'))) { return; }
        instrumentExpression(path.get('init'), state);
      }
    },
    ImportDeclaration: {
      exit(path, state) {
        // Source: import a from 'a';
        // Instrumented: ++count; import a from 'a';
        instrumentStatement(path, state, [
          'import',
          'statement'
        ]);
      }
    },
    ExportDeclaration: {
      // Source: export {};
      // Instrumented: ++count; export {};
      enter(path, state) {
        const decl = path.get('declaration');
        markAsIgnored(decl);
        if (decl.isFunctionDeclaration()) {
          instrumentBlock('body', decl.get('body'), state, ['function']);
        }
        instrumentStatement(path, state, [
          'export',
          'statement'
        ]);
      }
    },
    ReturnStatement: {
      exit(path, state) {
        // Source: return x;
        // Instrumented: ++count; return ++count, x;
        if (!isMarkedAsIgnored(path.get('argument'))) {
          instrumentExpression(path.get('argument'), state);
        }
        instrumentStatement(path, state);
      }
    },
    ClassDeclaration: {
      // Source: class Foo {}
      // Instrumented: ++count; class Foo {}
      exit: instrumentStatement
    },
    ClassProperty: {
      // Source: static a = 42;
      // Instrumented: static a = (++count, 42);
      exit(path, state) {
        instrumentExpression(path.get('value'), state);
      }
    },
    ClassMethod: {
      // Source: foo() {}
      // Instrumented: foo() { ++count; }
      exit(path, state) {
        const tags = path.node.kind === 'constructor' ?
          ['function'] : // TODO: 'constructor' is not allowed, what else?
          ['function'];
        instrumentBlock('body', path.get('body'), state, tags);
        if (path.node.computed) {
          // Source: ['x']() {}
          // Instrumented: [(++count, 'x')](): { ++count }
          instrumentExpression(path.get('key'), state);
        }
      }
    },
    FunctionDeclaration: {
      exit(path, state) {
        // Source: function () {}
        // Instrumented: ++count; function () { ++count; }
        instrumentStatement(path, state);
        instrumentBlock('body', path.get('body'), state, ['function']);
      }
    },
    FunctionExpression: {
      exit(path, state) {
        // Source: a = function () {}
        // Instrumented: a = function () { ++count; }
        instrumentBlock('body', path.get('body'), state, ['function']);
      }
    },
    ArrowFunctionExpression: {
      enter(path, state) {
        const body = path.get('body');
        if (body.isBlockStatement()) {
          // Source: x => {}
          // Instrumented: x => { ++count; }
          instrumentBlock('body', body, state, ['function']);
        } else {
          // Source: x => x
          // Instrumented: x => ++count, x
          instrumentExpression(body, state, [
            'function',
            'expression'
          ]);
        }
      }
    },
    ArrayExpression: {
      exit(path, state) {
        // Source: [42]
        // Instrumented: ++count; [(++count, 42)]
        // Don't instrument destructuring:
        if (path.parentPath.isPattern()) { return; }
        path.get('elements').forEach(el => instrumentExpression(el, state));
        if (!path.parentPath.isExpression()) {
          instrumentExpression(path, state);
        }
      }
    },
    ObjectProperty: {
      enter(path, state) {
        // Source: {a: 'b'}
        // Instrumented: {a: (++count, 'b')}
        // Don't instrument destructuring:
        if (path.parentPath.isPattern()) { return; }
        // instrumentExpression(path.get('value'), state);
        if (path.node.computed) {
          // Source: {['a']: 'b'}
          // Instrumented: _defineProperty(o, (++count, 'a'), (++count, 'b'));
          instrumentExpression(path.get('key'), state);
        } else {
          const oldKey = path.get('key');
          const newKeyName = oldKey.isLiteral() ?
            oldKey.node.value.toString() :
            oldKey.node.name;
          const newKey = t.stringLiteral(newKeyName);
          newKey.loc = oldKey.node.loc;
          oldKey.replaceWith(newKey);
          path.node.computed = true;
          instrumentExpression(oldKey, state);
        }
      }
    },
    ObjectMethod: {
      enter(path, state) {
        if (path.node.computed) {
          // Source: {['a'](){}}
          // Instrumented: {[(++count, 'a')]: (++count, function a() { ++count; }})
          instrumentExpression(path.get('key'), state);
          instrumentBlock('body', path.get('body'), state, ['function']);
        } else {
          // Source: {a(){}}
          // Instrumented: {a: (++count, function a() { ++count; }})
          const {key, params, body, loc} = path.node;
          // const fnKey = key.name in reserved ? null : key;
          // const fnExpr = t.functionExpression(fnKey, params, body); // FIXME
          const fnExpr = t.functionExpression(null, params, body);
          const objProp = t.objectProperty(key, fnExpr);
          fnExpr.loc = objProp.loc = loc;
          path.replaceWith(objProp);
        }
      }
    },
    IfStatement: {
      exit(path, state) {
        // Source: if (true) {} else {}
        // Instrumented: ++count; if ((++count, true)) { ++count; } else { ++count; }
        instrumentExpression(path.get('test'), state);
        instrumentBlock('body', path.get('consequent'), state, ['branch']);
        if (path.has('alternate') && path.get('alternate').isBlockStatement()) {
          instrumentBlock('body', path.get('alternate'), state, ['branch']);
        }
        // TODO: find a way to instrument the statement itself
        // instrumentStatement(path, state);
      }
    },
    ConditionalExpression: {
      exit(path, state) {
        // Source: true ? 1 : 2
        // Instrumented: ++count, (++count, true) ? (++count, 1) : (++count, 2)
        instrumentExpression(path.get('test'), state);
        instrumentExpression(path.get('consequent'), state, ['expression', 'branch']);
        instrumentExpression(path.get('alternate'), state, ['expression', 'branch']);
        instrumentExpression(path, state);
      }
    },
    SwitchStatement: {
      exit(path, state) {
        // Source: switch (a) {}
        // Instrumented: ++count; switch (++count, as) {}
        instrumentExpression(path.get('discriminant'), state);
        instrumentStatement(path, state);
      }
    },
    SwitchCase: {
      exit(path, state) {
        // Source: case 'a':
        // Instrumented: case (++count, 'a'): ++count;
        instrumentBlock('consequent', path, state, ['branch']);
        if (path.has('test')) {
          instrumentExpression(path.get('test'), state);
        }
      }
    },
    ForStatement: {
      // Source: for (let a = 1; a < 2; a++) {}
      // Instrumented: ++count; for (let a = 1; a < 2; a++) { ++count; }
      enter(path, state) {
        markAsIgnored(path.get('init'));
        instrumentBlock('body', path.get('body'), state, ['branch']);
        instrumentStatement(path, state);
      }
    },
    ForInStatement: {
      // This is a special case, where we cannot instrument the left side:
      // See also ForOfStatement
      enter(path, state) {
        // Source: for (let a in {x: 42}) {}
        // Instrumented: ++count; for (let a in (++count, {x: 42})) { ++count; }
        const left = path.get('left');
        markAsIgnored(left);
        if (left.isVariableDeclaration()) {
          left.get('declarations').map(markAsIgnored);
        }
        instrumentExpression(path.get('right'), state);
        instrumentBlock('body', path.get('body'), state, ['branch']);
        instrumentStatement(path, state);
      }
    },
    ForOfStatement: {
      // This is a special case, where we cannot instrument the left side:
      // See also ForInStatement
      enter(path, state) {
        // Source: for (let a of []) {}
        // Instrumented: ++count; for (let a of (++count, [])) { ++count; }
        const left = path.get('left');
        markAsIgnored(left);
        if (left.isVariableDeclaration()) {
          left.get('declarations').map(markAsIgnored);
        }
        instrumentExpression(path.get('right'), state);
        instrumentBlock('body', path.get('body'), state, ['branch']);
        instrumentStatement(path, state);
      }
    },
    WhileStatement: {
      exit(path, state) {
        // Source: while (cond) {}
        // instrumented: ++count; while (++count, cond) {}
        instrumentExpression(path.get('test'), state);
        instrumentBlock('body', path.get('body'), state, ['branch']);
        instrumentStatement(path, state);
      }
    },
    DoWhileStatement: {
      exit(path, state) {
        // Source: do {} while (cond);
        // instrumented: ++count; do {} while (++count, cond);
        instrumentExpression(path.get('test'), state);
        instrumentBlock('body', path.get('body'), state, ['branch']);
        instrumentStatement(path, state);
      }
    }
  };

  Object.keys(visitor).forEach(key => {
    if (typeof visitor[key] === 'function') {
      visitor[key] = safeguardVisitor(visitor[key]);
    } else {
      Object.keys(visitor[key]).forEach(fnKey => {
        visitor[key][fnKey] = safeguardVisitor(visitor[key][fnKey]);
      });
    }
  });

  return {
    visitor: {
      Program(path, state) {
        if (shouldSkipFile(state)) { return; }
        setCoverageMeta(state, {
          hash: hash(state.file.code),
          locations: [],
          variable: path.scope.generateUidIdentifier('ankaracoverage')
        });
        path.traverse(visitor, state);
        path.unshiftContainer('body', uid(state));
      }
    }
  };
}
