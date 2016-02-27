import test from 'tape';
import runFixture from './helpers/run';
import {isExpression, isFunction} from './helpers/tag-assert';

//
// Object properties
// --------------------

test('coverage should count object properties', t => {
  t.plan(2);
  runFixture('object-properties').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(l => l.count === 1);

    // There are 10 expressions total (extra 2 come from var declarations):
    t.equal(expressionLocations.length, 8 + 2);
    // All of them have been executed once:
    t.equal(executedOnceExpressionLocations.length, 10);
  });
});

test('coverage should count object methods', t => {
  t.plan(3);
  runFixture('object-methods').then(({locations}) => {
    const functionLocations = locations.filter(isFunction);
    const executedOnceFunctionLocations = functionLocations
      .filter(l => l.count === 1);
    const executedNeverFunctionLocations = functionLocations
      .filter(l => l.count === 0);

    // There are two methods:
    t.equal(functionLocations.length, 2);
    // One method was executed:
    t.equal(executedOnceFunctionLocations.length, 1);
    // The other method was not executed:
    t.equal(executedNeverFunctionLocations.length, 1);
  });
});

test('coverage should count expressions in object method declarations', t => {
  t.plan(2);
  runFixture('object-methods').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(l => l.count === 1);

    // There are 6 expressions total (4 unrelated to test):
    t.equal(expressionLocations.length, 2 + 4);
    // All expressions have been executed:
    t.equal(executedOnceExpressionLocations.length, 6);
  });
});
