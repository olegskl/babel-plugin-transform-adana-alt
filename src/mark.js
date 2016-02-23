export function markAsIgnored(node) {
  node[Symbol.for('ankaracoverage')] = true;
  return node;
}

export function isMarkedAsIgnored(node) {
  return node[Symbol.for('ankaracoverage')] === true;
}
