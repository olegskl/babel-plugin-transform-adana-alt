import test from 'tape';
import runFixture from './helpers/run';
import {isExpression, isStatement, isBranch} from './helpers/tag-assert';

//
// Do-while statements
// --------------------

test('coverage should count do-while statements', t => {
  t.plan(2);
  runFixture('do-while-statements').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    const executedStatementLocations = statementLocations
      .filter(el => el.count === 1);

    // There is one do-while statement:
    t.equal(statementLocations.length, 1);
    // The do-while statement has been run once:
    t.equal(executedStatementLocations.length, 1);
  });
});

test('coverage should count do-while test expressions', t => {
  t.plan(2);
  runFixture('do-while-statements').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(el => el.count === 1);

    // There is only one expression:
    t.equal(expressionLocations.length, 1);
    // The expression has run once:
    t.equal(executedOnceExpressionLocations.length, 1);
  });
});

test('coverage should count do-while branches', t => {
  t.plan(2);
  runFixture('do-while-statements').then(({locations}) => {
    const branchLocations = locations.filter(isBranch);
    const executedOnceBranchLocations = branchLocations
      .filter(el => el.count === 1);

    // There is only one branch:
    t.equal(branchLocations.length, 1);
    // The branch has been taken:
    t.equal(executedOnceBranchLocations.length, 1);
  });
});
