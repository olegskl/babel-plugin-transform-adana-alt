import test from 'tape';
import runFixture from './helpers/run';
import {isExpression} from './helpers/tag-assert';

//
// Call expressions
// --------------------

test('coverage should count call expression', t => {
  t.plan(2);
  runFixture('call-expressions').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(el => el.count === 1);

    // There are two expressions:
    t.equal(expressionLocations.length, 2);
    // Both expressions have been executed once:
    t.equal(executedOnceExpressionLocations.length, 2);
  });
});
