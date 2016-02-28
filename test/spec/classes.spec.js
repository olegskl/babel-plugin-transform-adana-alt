import test from 'tape';
import runFixture from './helpers/run';
import {
  isConstructor,
  isExpression,
  isStatement,
  isFunction
} from './helpers/tag-assert';

//
// Class declarations
// --------------------

test('coverage should count class declarations', t => {
  t.plan(3);
  runFixture('classes').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    const executedOnceStatementLocations = statementLocations
      .filter(l => l.count === 1);
    const executedTwiceStatementLocations = statementLocations
      .filter(l => l.count === 2);

    // There are 8 statements (1 class, 2 properties, 2 methods, 3 unrelated):
    t.equal(statementLocations.length, 8);
    // 7 statements have been executed once:
    t.equal(executedOnceStatementLocations.length, 7);
    // All 8 statements have been executed once:
    t.equal(executedTwiceStatementLocations.length, 1);
  });
});

//
// Class expressions
// --------------------

test('coverage should count expressions in classes', t => {
  t.plan(3);
  runFixture('classes').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(location => location.count === 1);
    const executedTwiceExpressionLocations = expressionLocations
      .filter(location => location.count === 2);

    // There is a total of 9 expressions (7 unrelated):
    t.equal(expressionLocations.length, 2 + 7);
    // 7 are executed once (incl. static property):
    t.equal(executedOnceExpressionLocations.length, 1 + 7);
    // One of them is executed twice (private property):
    t.equal(executedTwiceExpressionLocations.length, 1);
  });
});

//
// Class methods
// --------------------

test('coverage should count class constructors', t => {
  t.plan(1);
  runFixture('classes').then(({locations}) => {
    const constructorLocations = locations.filter(isConstructor);
    // There is only one constructor:
    t.equal(constructorLocations.length, 1);
  });
});

test('coverage should count class methods and track their executions', t => {
  t.plan(3);
  runFixture('classes').then(({locations}) => {
    const functionLocations = locations.filter(isFunction);
    const executedOnceFunctionLocations = functionLocations
      .filter(l => l.count === 1);
    const executedTwiceFunctionLocations = functionLocations
      .filter(l => l.count === 2);

    // There are only two methods:
    t.equal(functionLocations.length, 2);
    // One of them is called once (foo):
    t.equal(executedOnceFunctionLocations.length, 1);
    // One of them is called twice (constructor):
    t.equal(executedTwiceFunctionLocations.length, 1);
  });
});
