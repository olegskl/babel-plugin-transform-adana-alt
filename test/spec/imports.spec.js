import test from 'tape';
import runFixture from './helpers/run';
import {isImport, isStatement} from './helpers/tag-assert';

//
// Import statements
// --------------------

test('coverage should count import statements as imports', t => {
  t.plan(2);
  runFixture('import-statements').then(({locations}) => {
    const importLocations = locations.filter(isImport);
    t.equal(importLocations.length, 1);
    t.equal(importLocations.every(el => el.count === 1), true);
  });
});

test('coverage should count import statements as statements', t => {
  t.plan(2);
  runFixture('import-statements').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    t.equal(statementLocations.length, 1);
    t.equal(statementLocations.every(el => el.count === 1), true);
  });
});
