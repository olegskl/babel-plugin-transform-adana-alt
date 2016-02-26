import test from 'tape';
import runFixture from './helpers/run';
import {isStatement, isBranch} from './helpers/tag-assert';

//
// Try and throw statements
// --------------------

test('coverage should count try and throw statements', t => {
  t.plan(2);
  runFixture('try-catch').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    const executedOnceStatementLocations = statementLocations
      .filter(el => el.count === 1);

    // There are two statements (one for try-statement, one for throw statement):
    t.equal(statementLocations.length, 2);
    // Both statements have been run once:
    t.equal(executedOnceStatementLocations.length, 2);
  });
});

//
// Try-catch branches
// --------------------

test('coverage should count try-catch branches', t => {
  t.plan(2);
  runFixture('try-catch').then(({locations}) => {
    const branchLocations = locations.filter(isBranch);
    const executedOnceBranchLocations = branchLocations
      .filter(el => el.count === 1);

    // There are three branches:
    t.equal(branchLocations.length, 3);
    // All three branches have been taken once:
    t.equal(executedOnceBranchLocations.length, 3);
  });
});
