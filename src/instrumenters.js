import {types as t} from 'babel-core';
import {createMarker, markAsInstrumented} from './marker';

export function isInstrumentableStatement({parentPath}) {
  return parentPath.isBlockStatement() || parentPath.isProgram();
}

// 42 ---> (++count[id].count, 42)
export function instrumentExpression(path, state, tags = ['expression']) {
  tags.unshift('line'); // temporary solution
  const isEmptyNode = !path.node;
  const loc = isEmptyNode ? path.parent.loc : path.node.loc;
  const marker = createMarker(state, {loc, tags});
  const node = isEmptyNode ? t.identifier('undefined') : path.node;
  path.replaceWith(markAsInstrumented(
    t.sequenceExpression([marker, node])
  ));
}

// break; ---> ++count[0].count; break;
export function instrumentStatement(path, state, tags = ['statement']) {
  if (!isInstrumentableStatement(path)) { return; }
  tags.unshift('line'); // temporary solution
  const loc = path.node.loc;
  const marker = createMarker(state, {loc, tags});
  path.insertBefore(markAsInstrumented(
    t.expressionStatement(marker)
  ));
}

// {} ---> { ++count; }
export function instrumentBlock(container, path, state, tags = ['block']) {
  const loc = path.node.loc;
  const marker = createMarker(state, {loc, tags});
  markAsInstrumented(path).unshiftContainer(container, markAsInstrumented(
    t.expressionStatement(marker)
  ));
}

export function instrumentObjectProperty(path, state) {
  if (path.node.computed) { return; }
  const oldKey = path.get('key');
  const newKey = oldKey.isLiteral() ? oldKey : t.stringLiteral(oldKey.node.name);
  newKey.loc = oldKey.node.loc;
  oldKey.replaceWith(markAsInstrumented(newKey));
  path.node.computed = true;
  instrumentExpression(path.get('key'), state);
}

export function instrumentClassProperty(path, state, tags = ['statement', 'property']) {
  const value = path.get('value');
  const isEmptyNode = !value.node;
  const {loc} = isEmptyNode ? path.parent : path.node;
  const marker = createMarker(state, {loc, tags});
  const node = isEmptyNode ? t.identifier('undefined') : value.node;
  value.replaceWith(markAsInstrumented(
    t.sequenceExpression([marker, node])
  ));
}
