import {types} from 'babel-core';
import {getCoverageMeta} from './meta';

/**
* Marks a given path or node as instrumented.
* @param  {Path|Node} pathOrNode Path or Node to mark.
* @return {Path|Node}            Marked (mutated) Path or Node.
*/
export function markAsInstrumented(pathOrNode) {
  const node = pathOrNode.node || pathOrNode;
  node[Symbol.for('adanacoverage')] = true;
  return pathOrNode;
}

/**
 * Determines if a given path or node is instrumented.
 * @param  {Path|Node} pathOrNode Path or Node to check.
 * @return {Boolean}              True if instrumented, false otherwise.
 */
export function isInstrumented(pathOrNode) {
  const node = pathOrNode.node || pathOrNode;
  return node[Symbol.for('adanacoverage')] === true;
}

export function createMarker(state, {loc, tags}) {
  const {locations, variable} = getCoverageMeta(state);
  const id = locations.length;
  const marker = types.unaryExpression('++', types.memberExpression(
    types.memberExpression(variable, types.numericLiteral(id), true),
    types.identifier('count')
  ));
  locations.push({id, loc, tags, count: 0});
  return markAsInstrumented(marker);
}
