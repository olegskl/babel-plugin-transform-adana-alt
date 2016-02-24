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
    t.equal(expressionLocations.length, 4);
    t.equal(expressionLocations.filter(el => el.count === 1).length, 3);
    t.equal(expressionLocations.filter(el => el.count === 0).length, 1);
  });
});

test('coverage should count conditional expressions as branches', t => {
  t.plan(3);
  runFixture('conditional-expressions').then(({locations}) => {
    const branchLocations = locations.filter(isBranch);
    t.equal(branchLocations.length, 2);
    t.equal(branchLocations.filter(el => el.count === 1).length, 1);
    t.equal(branchLocations.filter(el => el.count === 0).length, 1);
  });
});

test('coverage should instrument conditional expression statements', t => {
  t.plan(2);
  runFixture('conditional-expressions').then(({locations}) => {
    const expressionLocations = locations.filter(isStatement);
    t.equal(expressionLocations.length, 1);
    t.equal(expressionLocations[0].count, 1);
  });
});
