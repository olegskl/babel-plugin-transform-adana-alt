import test from 'tape';
import runFixture from './helpers/run';
import {isExport} from './helpers/tag-assert';

//
// Export statements
// --------------------

test('coverage should count export statements', t => {
  t.plan(2);
  runFixture('export-statements').then(({locations}) => {
    const importLocations = locations.filter(isExport);
    t.equal(importLocations.length, 3);
    t.equal(importLocations.every(el => el.count === 1), true);
  });
});
