import {readFileSync} from 'fs';
import path from 'path';
import template from 'babel-template';
import {getCoverageMeta} from './meta';
import astify from './astify';

const preludeFilePath = path.resolve(__dirname, 'templates/uid.js');
const render = template(readFileSync(preludeFilePath, 'utf8'));

export const defaultNamespace = '__ankaracoverage__';

export default function uid(state) {
  const {hash, variable, locations} = getCoverageMeta(state);
  const name = state.file.opts.filenameRelative;
  const namespace = state.opts && state.opts.global || defaultNamespace;
  return render({
    NAMESPACE: astify(namespace),
    HASH: astify(hash),
    VARIABLE: variable,
    FILEPATH: astify(name),
    LOCATIONS: astify(locations)
  });
}
