import test from 'tape';
import runFixture from './helpers/run';
import {isExpression, isStatement, isBranch} from './helpers/tag-assert';

//
// Conditional expressions
// --------------------

test('coverage should count conditional expressions', t => {
  t.plan(3);
  runFixture('conditional-expressions').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedNeverExpressionLocations = expressionLocations
      .filter(l => l.count === 0);
    const executedOnceExpressionLocations = expressionLocations
      .filter(l => l.count === 1);

    t.equal(expressionLocations.length, 4);
    t.equal(executedOnceExpressionLocations.length, 3);
    t.equal(executedNeverExpressionLocations.length, 1);
  });
});

test('coverage should count conditional expressions as branches', t => {
  t.plan(3);
  runFixture('conditional-expressions').then(({locations}) => {
    const branchLocations = locations.filter(isBranch);
    const executedNeverBranchLocations = branchLocations
      .filter(l => l.count === 0);
    const executedOnceBranchLocations = branchLocations
      .filter(l => l.count === 1);

    t.equal(branchLocations.length, 2);
    t.equal(executedOnceBranchLocations.length, 1);
    t.equal(executedNeverBranchLocations.length, 1);
  });
});

test('coverage should instrument conditional expression statements', t => {
  t.plan(2);
  runFixture('conditional-expressions').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    const executedOnceExpressionLocations = statementLocations
      .filter(l => l.count === 1);

    t.equal(statementLocations.length, 1);
    t.equal(executedOnceExpressionLocations.length, 1);
  });
});
