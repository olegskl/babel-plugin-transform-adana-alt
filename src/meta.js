export function setCoverageMeta(state, meta = {}) {
  state.file.metadata.coverage = meta;
  return state;
}

export function getCoverageMeta(state) {
  return state.file.metadata.coverage;
}
