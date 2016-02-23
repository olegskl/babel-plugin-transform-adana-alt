export function isFunction({tags}) {
  return tags.some(tag => tag === 'function');
}

export function isStatement({tags}) {
  return tags.some(tag => tag === 'statement');
}

export function isExpression({tags}) {
  return tags.some(tag => tag === 'expression');
}

export function isImport({tags}) {
  return tags.some(tag => tag === 'import');
}

export function isExport({tags}) {
  return tags.some(tag => tag === 'export');
}
