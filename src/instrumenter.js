import {util} from 'babel-core';
import hash from './hash';
import uid from './uid';
import {getCoverageMeta, setCoverageMeta} from './meta';
import {markAsIgnored, isMarkedAsIgnored} from './mark';

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

  function isInstrumentableStatement({parentPath}) {
    return !parentPath.isReturnStatement() &&
      !parentPath.isExportDeclaration() &&
      !parentPath.isFunctionDeclaration();
  }

  // function instrument(path, state) {
  //   const marker = createMarker();
  //   if (path.isExpression()) {
  //     // 42 ---> (++_counter[id].count, 42)
  //     path.replaceWith(markAsIgnored(t.sequenceExpression([marker, path.node])));
  //   } else if (path.isBlockStatement()) {
  //     // {} ---> { ++_counter[id].count; }
  //     path.unshiftContainer('body', markAsIgnored(t.expressionStatement(marker)));
  //   } else if (path.isSwitchCase()) {
  //     // case 'a': {} ---> case 'a': { ++_counter[id].count }
  //     path.unshiftContainer('consequent', markAsIgnored(t.expressionStatement(marker)));
  //   } else if (path.isVariableDeclarator()) {
  //     // let a = 42; ---> let a = (++_counter[id].count, 42);
  //     path.get('init').replaceWith(markAsIgnored(t.sequenceExpression([marker, path.node.init])));
  //   } else if (path.parentPath.isReturnStatement() && !path.parentPath.has('argument')) {
  //     // return; ---> return (++_counter[id].count, undefined);
  //     path.replaceWith(markAsIgnored(t.sequenceExpression([marker, t.identifier('undefined')])));
  //   } else if (path.isStatement() && isInstrumentableStatement(path)) {
  //     // a = 1; ---> ++_counter[id].count; a = 1;
  //     path.insertBefore(markAsIgnored(t.expressionStatement(marker)));
  //   }
  // }

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
    if (!isInstrumentableStatement(path)) { return; }
    const loc = path.node.loc;
    const marker = createMarker(state, {loc, tags});
    path.insertBefore(markAsIgnored(
      t.expressionStatement(marker)
    ));
  }

  // {} ---> { ++_ankaracoverage[0].count; }
  function instrumentBlock(path, state, tags) {
    const loc = path.node.loc;
    const marker = createMarker(state, {loc, tags});
    path.unshiftContainer('body', markAsIgnored(
      t.expressionStatement(marker)
    ));
  }

  const visitor = {
    // Expression: instrumentExpression,
    ExpressionStatement: instrumentStatement,
    UpdateExpression: instrumentExpression,
    BinaryExpression(path, state) {
      // Source: true === true
      // Instrumented: (++count, true) === (++count, true)
      instrumentExpression(path.get('left'), state);
      instrumentExpression(path.get('right'), state);
    },
    BreakStatement: instrumentStatement,
    ContinueStatement: instrumentStatement,
    VariableDeclaration(path, state) {
      // Source: const a = 'a';
      // Instrumented: ++count; const a = 'a';
      instrumentStatement(path, state, [
        'variable',
        'statement'
      ]);
    },
    VariableDeclarator(path, state) {
      // Source: let a = 42, b = 43;
      // Instrumented: let a = (++count, 42), b = (++count, 43);
      instrumentExpression(path.get('init'), state);
    },
    ImportDeclaration(path, state) {
      // Source: import a from 'a';
      // Instrumented: ++count; import a from 'a';
      instrumentStatement(path, state, [
        'import',
        'statement'
      ]);
    },
    ExportDeclaration(path, state) {
      // Source: export {};
      // Instrumented: ++count; export {};
      instrumentStatement(path, state, [
        'export',
        'statement'
      ]);
    },
    ReturnStatement(path, state) {
      // Source: return x;
      // Instrumented: return ++count, x;
      instrumentExpression(path.get('argument'), state);
    },
    FunctionDeclaration(path, state) {
      // Source: function () {}
      // Instrumented: ++count; function () { ++count; }
      instrumentStatement(path, state);
      instrumentBlock(path.get('body'), state, ['function']);
    },
    FunctionExpression(path, state) {
      // Source: a = function () {}
      // Instrumented: a = function () { ++count; }
      instrumentBlock(path.get('body'), state, ['function']);
    },
    ObjectProperty(path, state) {
      // Source: {a: 'b'}
      // Instrumented: {a: (++count, 'b')}
      instrumentExpression(path.get('value'), state);
      if (path.node.computed) {
        // Source: {['a']: 'b'}
        // Instrumented: _defineProperty(o, (++count, 'a'), (++count, 'b'));
        instrumentExpression(path.get('key'), state);
      }
    },
    ObjectMethod(path, state) {
      if (path.node.computed) {
        // Source: {['a'](){}}
        // Instrumented: {[(++count, 'a')]: (++count, function a() { ++count; }})
        instrumentExpression(path.get('key'), state);
        instrumentBlock(path.get('body'), state, ['function']);
      } else {
        // Source: {a(){}}
        // Instrumented: {a: (++count, function a() { ++count; }})
        const {key, params, body, loc} = path.node;
        const fnExpr = t.functionExpression(key, params, body);
        const objProp = t.objectProperty(key, fnExpr);
        fnExpr.loc = objProp.loc = loc;
        path.replaceWith(objProp);
        // instrumentBlock(path.get('value').get('body'), state, ['function']);
      }
    },
    ArrowFunctionExpression(path, state) {
      const body = path.get('body');
      if (body.isBlockStatement()) {
        // Source: x => {}
        // Instrumented: x => { ++count; }
        instrumentBlock(body, state, ['function']);
      } else {
        // Source: x => x
        // Instrumented: x => ++count, x
        instrumentExpression(body, state, [
          'function',
          'expression'
        ]);
      }
    },
    // ConditionalExpression(path) {
    //   instrument(path.get('consequent'));
    //   instrument(path.get('alternate'));
    // },
    // SwitchCase(path) {
    //   instrument(path);
    //   instrument(path.get('test'));
    // },
    // SwitchStatement(path) {
    //   instrument(path.get('discriminant'));
    // },
    // ForStatement(path) {
    //   instrument(path.get('body'));
    // },
    // WhileStatement(path) {
    //   instrument(path.get('test'));
    //   instrument(path.get('body'));
    // },
    // DoWhileStatement(path) {
    //   instrument(path.get('test'));
    //   instrument(path.get('body'));
    // },
    IfStatement(path, state) {
      // Source: if (true) {} else {}
      // Instrumented: if ((++count, true)) { ++count; } else { ++count; }
      instrumentExpression(path.get('test'), state);
      instrumentBlock(path.get('consequent'), state, ['branch']);
      if (path.has('alternate') && path.get('alternate').isBlockStatement()) {
        instrumentBlock(path.get('alternate'), state, ['branch']);
      }
    }
  };

  Object.keys(visitor).forEach(key => {
    visitor[key] = {
      exit: safeguardVisitor(visitor[key])
    };
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
