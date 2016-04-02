import {util} from 'babel-core';
import prelude from './prelude';
import {setCoverageMeta} from './meta';
import visitors from './visitors';
import {fnv} from './hash';

function shouldSkipFile({opts, file} = {}) {
  if (!file || !opts) { return false; }
  const {ignore = [], only} = opts;
  return util.shouldIgnore(
    file.opts.filename,
    util.arrayify(ignore, util.regexify),
    only ? util.arrayify(only, util.regexify) : null
  );
}

function Program(path, state) {
  if (shouldSkipFile(state)) { return; }
  const filenameHash = fnv(state.file.opts.filename);
  setCoverageMeta(state, {
    locations: [],
    variable: path.scope.generateUidIdentifier(filenameHash)
  });
  path.traverse(visitors, state);
  path.unshiftContainer('body', prelude(state));
}

export default function babelPluginTransformAdana() {
  return {
    visitor: {Program}
  };
}
