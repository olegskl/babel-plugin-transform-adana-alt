export function markAsIgnored(pathOrNode) {
  const node = pathOrNode.node || pathOrNode;
  node[Symbol.for('ankaracoverage')] = true;
  return pathOrNode;
}

export function isMarkedAsIgnored(pathOrNode) {
  const node = pathOrNode.node || pathOrNode;
  return node[Symbol.for('ankaracoverage')] === true;
}
