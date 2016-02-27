/**
* Marks a given path or node as instrumented.
* @param  {Path|Node} pathOrNode Path or Node to mark.
* @return {Path|Node}            Marked (mutated) Path or Node.
*/
export function markAsInstrumented(pathOrNode) {
  const node = pathOrNode.node || pathOrNode;
  node[Symbol.for('ankaracoverage')] = true;
  return pathOrNode;
}

/**
 * Determines if a given path or node is instrumented.
 * @param  {Path|Node} pathOrNode Path or Node to check.
 * @return {Boolean}              True if instrumented, false otherwise.
 */
export function isInstrumented(pathOrNode) {
  const node = pathOrNode.node || pathOrNode;
  return node[Symbol.for('ankaracoverage')] === true;
}
