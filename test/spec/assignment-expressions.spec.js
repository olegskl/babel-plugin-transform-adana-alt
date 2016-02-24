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
      .filter(el => el.count === 1)
      .length;

    // There are two expressions:
    t.equal(expressionLocations.length, 2);
    // Both expressions have been executed:
    t.equal(executedOnceExpressionLocations, 2);
  });
});
