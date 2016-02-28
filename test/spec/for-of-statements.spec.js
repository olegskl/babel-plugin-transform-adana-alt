import test from 'tape';
import runFixture from './helpers/run';
import {isExpression, isStatement, isBranch} from './helpers/tag-assert';

//
// For-of statements
// --------------------

test('coverage should count for-of statements', t => {
  t.plan(2);
  runFixture('for-of-statements').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    const executedOnceStatementLocations = statementLocations
      .filter(el => el.count === 1)
      .length;

    // There is one for-of statement:
    t.equal(statementLocations.length, 1);
    // The for-of statement has been run once:
    t.equal(executedOnceStatementLocations, 1);
  });
});

test('coverage should count for-of statement test expressions', t => {
  t.plan(2);
  runFixture('for-of-statements').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(el => el.count === 1)
      .length;

    // There is only one expression:
    t.equal(expressionLocations.length, 1);
    // The expression has run once:
    t.equal(executedOnceExpressionLocations, 1);
  });
});

test('coverage should count for-of statement branches', t => {
  t.plan(2);
  runFixture('for-of-statements').then(({locations}) => {
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
