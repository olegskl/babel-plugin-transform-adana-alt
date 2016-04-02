import {readFileSync} from 'fs';
import path from 'path';
import {types} from 'babel-core';
import template from 'babel-template';
import {getCoverageMeta} from './meta';

const preludeFilePath = path.resolve(__dirname, 'templates/prelude.js');
const render = template(readFileSync(preludeFilePath, 'utf8'));

export const defaultNamespace = '__coverage__';

export default function prelude(state) {
  const {variable, locations} = getCoverageMeta(state);
  const name = state.file.opts.filenameRelative;
  const namespace = state.opts && state.opts.global || defaultNamespace;
  return render({
    VARIABLE: variable,
    NAMESPACE: types.stringLiteral(namespace),
    FILEPATH: types.stringLiteral(name),
    LOCATIONS: types.stringLiteral(JSON.stringify(locations))
  });
}
