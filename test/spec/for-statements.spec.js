import test from 'tape';
import runFixture from './helpers/run';
import {isExpression, isStatement, isBranch} from './helpers/tag-assert';

//
// For-statements
// --------------------

test('coverage should count for-statement statements', t => {
  t.plan(2);
  runFixture('for-statements').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    const executedStatementLocations = statementLocations
      .filter(el => el.count === 1)
      .length;

    // There is one for-statement statement:
    t.equal(statementLocations.length, 1);
    // The for-statement statement has been run once:
    t.equal(executedStatementLocations, 1);
  });
});

test('coverage should count for-statement test expressions', t => {
  t.plan(3);
  runFixture('for-statements').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(el => el.count === 1);
    const executedTwiceExpressionLocations = expressionLocations
      .filter(el => el.count === 2);

    // There are at 6 expressions:
    t.equal(expressionLocations.length, 6);
    // Three of them have run twice:
    t.equal(executedTwiceExpressionLocations.length, 3);
    // The other three have run once:
    t.equal(executedOnceExpressionLocations.length, 3);
  });
});

test.skip('coverage should count for-statement branches', t => {
  t.plan(2);
  runFixture('for-statements').then(({locations}) => {
    const branchLocations = locations.filter(isBranch);
    const executedBranchLocations = branchLocations
      .filter(el => el.count === 1)
      .length;

    // There is only one branch:
    t.equal(branchLocations.length, 1);
    // The branch is taken only once:
    t.equal(executedBranchLocations, 1);
  });
});
