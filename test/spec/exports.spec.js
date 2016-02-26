import test from 'tape';
import runFixture from './helpers/run';
import {
  isExport,
  isFunction,
  isStatement
} from './helpers/tag-assert';

//
// Export statements
// --------------------

test('coverage should count exports', t => {
  t.plan(2);
  runFixture('export-statements').then(({locations}) => {
    const exportLocations = locations.filter(isExport);
    const executedOnceExportLocations = exportLocations
      .filter(el => el.count === 1);

    t.equal(exportLocations.length, 3);
    t.equal(executedOnceExportLocations.length, 3);
  });
});

test('coverage should count exports as statements', t => {
  t.plan(2);
  runFixture('export-statements').then(({locations}) => {
    const exportStatements = locations.filter(isStatement);
    const executedOnceStatements = exportStatements
      .filter(el => el.count === 1);

    t.equal(exportStatements.length, 3);
    t.equal(executedOnceStatements.length, 3);
  });
});

test('coverage should count export function declarations', t => {
  t.plan(2);
  runFixture('export-statements').then(({locations}) => {
    const functionLocations = locations.filter(isFunction);
    const executedNeverFunctionLocations = functionLocations
      .filter(el => el.count === 0);

    // There is one function:
    t.equal(functionLocations.length, 1);
    // The function has not been executed:
    t.equal(executedNeverFunctionLocations.length, 1);
  });
});
