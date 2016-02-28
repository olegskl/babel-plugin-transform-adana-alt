import babelPluginTransformAdana from '../../../src/plugin';
import {transformFile} from 'babel-core';

export default function transformFixture(fixturePath) {
  return new Promise(function promiseExecutor(resolve, reject) {
    transformFile(fixturePath, {
      presets: ['es2015'],
      plugins: [
        babelPluginTransformAdana,
        'transform-class-properties'
      ],
      sourceType: 'module',
      ast: false
    }, function transformFileCallback(error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
