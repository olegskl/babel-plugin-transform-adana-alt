import test from 'tape';
import runFixture from './helpers/run';
import {isExpression, isStatement} from './helpers/tag-assert';

//
// Switch statements
// --------------------

test('coverage should count switch-statement statements', t => {
  t.plan(2);
  runFixture('switch-statements').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    const executedTestExpressions = statementLocations
      .filter(el => el.count === 1)
      .length;

    // There is just one statement
    t.equal(statementLocations.length, 1);
    // The statement has been run
    t.equal(executedTestExpressions, 1);
  });
});

test('coverage should count switch-statement test expressions', t => {
  t.plan(2);
  runFixture('switch-statements').then(({locations}) => {
    const testExpressions = locations.filter(isExpression);
    const executedTestExpressions = testExpressions
      .filter(el => el.count === 1)
      .length;

    // There is just one test
    t.equal(testExpressions.length, 1);
    // The test has been run
    t.equal(executedTestExpressions, 1);
  });
});
