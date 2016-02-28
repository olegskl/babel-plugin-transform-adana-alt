import path from 'path';
import {runInNewContext} from 'vm';
import transform from './transform';
import {defaultNamespace as namespace} from '../../../src/prelude';

export default function runFixture(fixtureName) {
  const fixturePath = path.resolve(__dirname, `../../fixture/${fixtureName}.fixture.js`);
  return transform(fixturePath).then(({code}) => {
    const sandbox = {
      require,
      global: {},
      exports: {}
    };
    runInNewContext(code, sandbox);
    return sandbox.global[namespace][fixturePath];
  });
}
