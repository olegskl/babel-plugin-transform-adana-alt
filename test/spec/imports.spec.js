import test from 'tape';
import runFixture from './helpers/run';
import {isImport} from './helpers/tag-assert';

//
// Import statements
// --------------------

test('coverage should count import statements', t => {
  t.plan(2);
  runFixture('import-statements').then(({locations}) => {
    const importLocations = locations.filter(isImport);
    t.equal(importLocations.length, 1);
    t.equal(importLocations.every(el => el.count === 1), true);
  });
});
