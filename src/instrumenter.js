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
    if (path.node && path.node.loc && !isMarkedAsIgnored(path)) {
      visitor(path, state); // visitors don't return
    }
  };
}

export default function instrumenter({types: t}) {

  function createMarker(state, {loc, tags}) {
    const {locations, variable} = getCoverageMeta(state);
    const id = locations.length;
    locations.push({id, loc, tags, count: 0});
    return markAsIgnored(t.expressionStatement(
      t.unaryExpression('++', t.memberExpression(
        t.memberExpression(variable, t.numericLiteral(id), true),
        t.identifier('count')
      ))
    ));
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
  // function instrumentExpression(path, state) {
  //   const isEmptyNode = !path.node;
  //   const loc = isEmptyNode ? path.parent.loc : path.node.loc;
  //   const tags = ['line'];
  //   const marker = createMarker(state, {loc, tags});
  //   const node = isEmptyNode ? t.identifier('undefined') : path.node;
  //   path.replaceWith(markAsIgnored(t.sequenceExpression([marker, node])));
  // }

  // break; ---> ++_ankaracoverage[0].count; break;
  function instrumentStatement(path, state, tags = ['statement']) {
    if (!isInstrumentableStatement(path)) { return; }
    const loc = path.node.loc;
    const marker = createMarker(state, {loc, tags});
    path.insertBefore(marker);
  }

  // {} ---> { ++_ankaracoverage[0].count; }
  function instrumentBlock(path, state, tags) {
    const loc = path.node.loc;
    const marker = createMarker(state, {loc, tags});
    path.unshiftContainer('body', marker);
  }

  const visitor = {
    // BreakStatement: instrumentStatement,
    // ContinueStatement: instrumentStatement,
    // ExpressionStatement: instrumentStatement,
    FunctionDeclaration(path, state) {
      instrumentStatement(path, state);
      instrumentBlock(path.get('body'), state, ['function']);
    }
    // ReturnStatement(path, state) {
    //   instrumentExpression(path.get('argument'), state);
    // }
    // ExportDeclaration(path) {
    //   instrument(path);
    // },
    // VariableDeclarator(path) {
    //   instrument(path);
    // },
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
    // IfStatement(path) {
    //   instrument(path.get('test'));
    //   instrument(path.get('consequent'));
    //   const alternate = path.get('alternate');
    //   if (alternate) {
    //     instrument(alternate);
    //   }
    // },
    // UpdateExpression(path) {
    //   instrument(path.get('argument'));
    // },
    // BinaryExpression(path) {
    //   instrument(path.get('left'));
    //   instrument(path.get('right'));
    // },
    // FunctionDeclaration(path, state) {
    //   // instrumentBlock(path.get('body'), state);
    //   instrumentStatement(path, state);
    // }
  };

  Object.keys(visitor).forEach(key => {
    visitor[key] = safeguardVisitor(visitor[key]);
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
