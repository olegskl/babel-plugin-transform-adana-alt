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

/**
 * Create a non-instrumentable marker.
 * @param  {Object} state Babel state object.
 * @param  {Object} path  Babel path object.
 * @param  {Object} node  Babel path's node object.
 * @return {Node}         Marker.
 */
export function createMarker(state, {loc, tags}, node) {
  const {locations, variable} = getCoverageMeta(state);
  const id = locations.length;
  const args = [types.numericLiteral(id)];
  if (node) {
    args.push(node);
  }
  const marker = types.callExpression(variable, args);
  locations.push({id, loc, tags, count: 0});
  return markAsInstrumented(marker);
}
