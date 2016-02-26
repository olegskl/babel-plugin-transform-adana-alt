import test from 'tape';
import runFixture from './helpers/run';
import {isExpression, isStatement, isBranch} from './helpers/tag-assert';

//
// For-in statements
// --------------------

test('coverage should count for-in statements', t => {
  t.plan(2);
  runFixture('for-in-statements').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    const executedOnceStatementLocations = statementLocations
      .filter(el => el.count === 1);

    // There is one for-in statement:
    t.equal(statementLocations.length, 1);
    // The for-in statement has been run once:
    t.equal(executedOnceStatementLocations.length, 1);
  });
});

test('coverage should count for-in statement test expressions', t => {
  t.plan(2);
  runFixture('for-in-statements').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(el => el.count === 1);

    // There are three expressions:
    t.equal(expressionLocations.length, 3);
    // All expressions have run once:
    t.equal(executedOnceExpressionLocations.length, 3);
  });
});

test.skip('coverage should count for-in statement branches', t => {
  t.plan(2);
  runFixture('for-in-statements').then(({locations}) => {
    const branchLocations = locations.filter(isBranch);
    const executedOnceBranchLocations = branchLocations
      .filter(el => el.count === 1);

    // There is only one branch:
    t.equal(branchLocations.length, 1);
    // The branch is taken only once:
    t.equal(executedOnceBranchLocations.length, 1);
  });
});
