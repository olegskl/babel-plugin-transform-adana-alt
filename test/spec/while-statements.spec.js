import test from 'tape';
import runFixture from './helpers/run';
import {isExpression, isStatement, isBranch} from './helpers/tag-assert';

//
// While-statements
// --------------------

test('coverage should count while-statement statements', t => {
  t.plan(2);
  runFixture('while-statements').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    const executedStatementLocations = statementLocations
      .filter(el => el.count === 1)
      .length;

    // There is one while-statement statement:
    t.equal(statementLocations.length, 1);
    // The while-statement statement has been run once:
    t.equal(executedStatementLocations, 1);
  });
});

test('coverage should count while-statement test expressions', t => {
  t.plan(2);
  runFixture('while-statements').then(({locations}) => {
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

test('coverage should count while-statement branches', t => {
  t.plan(2);
  runFixture('while-statements').then(({locations}) => {
    const branchLocations = locations.filter(isBranch);
    const executedOnceBranchLocations = branchLocations
      .filter(el => el.count === 1)
      .length;

    // There is only one branch:
    t.equal(branchLocations.length, 1);
    // The branch has not been taken:
    t.equal(executedOnceBranchLocations, 0);
  });
});
