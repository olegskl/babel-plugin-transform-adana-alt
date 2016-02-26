import test from 'tape';
import runFixture from './helpers/run';
import {isExpression} from './helpers/tag-assert';

//
// Assignment expressions
// --------------------

test('coverage should count assignment expressions', t => {
  t.plan(2);
  runFixture('assignment-expressions').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(el => el.count === 1);

    // There are 3 expressions:
    t.equal(expressionLocations.length, 3);
    // All expressions have been executed once:
    t.equal(executedOnceExpressionLocations.length, 3);
  });
});
