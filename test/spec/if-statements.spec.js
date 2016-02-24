import test from 'tape';
import runFixture from './helpers/run';
import {isExpression, isBranch} from './helpers/tag-assert';

//
// If statements
// --------------------

test('coverage should count if-statement test expressions', t => {
  t.plan(2);
  runFixture('if-statements').then(({locations}) => {
    const testExpressions = locations.filter(isExpression);
    const executedTestExpressions = testExpressions
      .filter(el => el.count === 1)
      .length;

    // There are two tests (final else branch has no test):
    t.equal(testExpressions.length, 2);
    // Only one of two test has actually run (the truthy one):
    t.equal(executedTestExpressions, 1);
  });
});

test('coverage should count if-statement branches', t => {
  t.plan(2);
  runFixture('if-statements').then(({locations}) => {
    const testBranches = locations.filter(isBranch);
    const executedTestBranches = testBranches
      .filter(el => el.count === 1)
      .length;

    // There are three branches:
    t.equal(testBranches.length, 3);
    // Only one of the three branches has actually run (the truthy one):
    t.equal(executedTestBranches, 1);
  });
});
