import test from 'tape';
import runFixture from './helpers/run';
import {isExpression} from './helpers/tag-assert';

//
// Logical expressions
// --------------------

test('coverage should count logical expressions', t => {
  t.plan(3);
  runFixture('logical-expressions').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(el => el.count === 1)
      .length;
    const executedNeverExpressionLocations = expressionLocations
      .filter(el => el.count === 0)
      .length;

    // There are four expressions
    t.equal(expressionLocations.length, 4);
    // Only three have been executed:
    t.equal(executedOnceExpressionLocations, 3);
    // One has not been skipped:
    t.equal(executedNeverExpressionLocations, 1);
  });
});
