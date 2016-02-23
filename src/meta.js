export function setCoverageMeta(state, meta = {}) {
  state.file.metadata.ankaracoverage = meta;
  return state;
}

export function getCoverageMeta(state) {
  return state.file.metadata.ankaracoverage;
}
