/* eslint-disable no-underscore-dangle */
import path from 'path';
import {runInNewContext} from 'vm';
import transform from './transform';
import {defaultNamespace as namespace} from '../../../src/uid';

export default function runFixture(fixtureName) {
  const fixturePath = path.resolve(__dirname, `../../fixture/${fixtureName}.fixture.js`);
  return transform(fixturePath)
    .then(function handleTransformSuccess({code}) {
      console.error('-'.repeat(60));
      console.error(code)
      console.error('-'.repeat(60));
      const sandbox = {
        require,
        global: {},
        exports: {}
      };
      runInNewContext(code, sandbox);
      return sandbox.global[namespace][fixturePath];
    });
}
