import test from 'tape';
import runFixture from './helpers/run';
import {isStatement, isExpression} from './helpers/tag-assert';

//
// Array expressions
// --------------------

test('coverage should count array expressions', t => {
  t.plan(3);
  runFixture('array-expressions').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(el => el.count === 1);

    // There is one statement:
    t.equal(statementLocations.length, 1);
    // There are three expressions:
    t.equal(expressionLocations.length, 3);
    // All expressions have been executed:
    t.equal(executedOnceExpressionLocations.length, 3);
  });
});
