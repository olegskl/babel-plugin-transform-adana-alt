import test from 'tape';
import runFixture from './helpers/run';
import {isExpression, isBranch} from './helpers/tag-assert';

//
// Switch cases
// --------------------

test('coverage should count switch-case test expressions', t => {
  t.plan(2);
  runFixture('switch-cases').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedTestExpressions = expressionLocations
      .filter(el => el.count === 1)
      .length;

    // There are three expressions total:
    t.equal(expressionLocations.length, 2 + 1); // 1 extra is from switch statement test
    // All expressions have been run:
    t.equal(executedTestExpressions, 2 + 1);
  });
});

test('coverage should count switch-case blocks as branches', t => {
  t.plan(2);
  runFixture('switch-cases').then(({locations}) => {
    const branchLocations = locations.filter(isBranch);
    const executedBranchLocations = branchLocations
      .filter(el => el.count === 1)
      .length;

    // There are three branches:
    t.equal(branchLocations.length, 3);
    // Only the final (default) branch has been taken:
    t.equal(executedBranchLocations, 1);
  });
});
