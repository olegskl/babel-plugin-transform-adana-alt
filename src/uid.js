import {readFileSync} from 'fs';
import path from 'path';
import template from 'babel-template';
// import {types as t} from 'babel-core';
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
    VARIABLE: variable,
    NAMESPACE: astify(namespace),
    HASH: astify(hash),
    FILEPATH: astify(name),
    LOCATIONS: astify(locations)
  });
  // return t.variableDeclaration(
  //   'const',
  //   [t.variableDeclarator(variable, render({
  //     NAMESPACE: astify(namespace),
  //     HASH: astify(hash),
  //     FILEPATH: astify(name),
  //     LOCATIONS: astify(locations)
  //   }))]
  // );
}
