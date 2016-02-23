import test from 'tape';
import runFixture from './helpers/run';
import {isVariable, isStatement, isExpression} from './helpers/tag-assert';

//
// Variable declarations
// --------------------

test('coverage should count variable declarations as variables', t => {
  t.plan(2);
  runFixture('variable-declarations').then(({locations}) => {
    const variableLocations = locations.filter(isVariable);
    t.equal(variableLocations.length, 6);
    t.equal(variableLocations.every(el => el.count === 1), true);
  });
});

test('coverage should count variable declarations as statements', t => {
  t.plan(2);
  runFixture('variable-declarations').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    t.equal(statementLocations.length, 6);
    t.equal(statementLocations.every(el => el.count === 1), true);
  });
});

//
// Variable expressions
// --------------------

test('coverage should count variable declarations', t => {
  t.plan(2);
  runFixture('variable-declarations').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    t.equal(expressionLocations.length, 9);
    t.equal(expressionLocations.every(el => el.count === 1), true);
  });
});
