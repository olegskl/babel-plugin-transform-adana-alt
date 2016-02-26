import test from 'tape';
import runFixture from './helpers/run';
import {isExpression, isBranch} from './helpers/tag-assert';

//
// Logical expressions
// --------------------

test('coverage should count logical expressions', t => {
  t.plan(3);
  runFixture('logical-expressions').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(el => el.count === 1);
    const executedNeverExpressionLocations = expressionLocations
      .filter(el => el.count === 0);

    // There are five expressions
    t.equal(expressionLocations.length, 5);
    // Only four have been executed:
    t.equal(executedOnceExpressionLocations.length, 4);
    // One has been skipped:
    t.equal(executedNeverExpressionLocations.length, 1);
  });
});

test('coverage should count logical branches', t => {
  t.plan(3);
  runFixture('logical-expressions').then(({locations}) => {
    const branchLocations = locations.filter(isBranch);
    const executedOnceBranchLocations = branchLocations
      .filter(el => el.count === 1);
    const executedNeverBranchLocations = branchLocations
      .filter(el => el.count === 0);

    // There are four branches
    t.equal(branchLocations.length, 4);
    // Only three have been taken:
    t.equal(executedOnceBranchLocations.length, 3);
    // One has been skipped:
    t.equal(executedNeverBranchLocations.length, 1);
  });
});
