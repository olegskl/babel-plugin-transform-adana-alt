export function isFunction({tags}) {
  return tags.some(tag => tag === 'function');
}

export function isConstructor({tags}) {
  return tags.some(tag => tag === '_constructor');
}

export function isBranch({tags}) {
  return tags.some(tag => tag === 'branch');
}

export function isStatement({tags}) {
  return tags.some(tag => tag === 'statement');
}

export function isExpression({tags}) {
  return tags.some(tag => tag === 'expression');
}

export function isVariable({tags}) {
  return tags.some(tag => tag === 'variable');
}

export function isImport({tags}) {
  return tags.some(tag => tag === 'import');
}

export function isExport({tags}) {
  return tags.some(tag => tag === 'export');
}
