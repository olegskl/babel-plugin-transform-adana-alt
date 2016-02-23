import test from 'tape';
import runFixture from './helpers/run';
import {isFunction, isStatement} from './helpers/tag-assert';

//
// Normal functions
// --------------------

test('coverage should count function declarations', t => {
  t.plan(3);
  runFixture('function-declarations').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    t.equal(statementLocations.length, 2);
    t.equal(statementLocations[0].count, 1);
    t.equal(statementLocations[1].count, 1);
  });
});

test('coverage should count function executions', t => {
  t.plan(4);
  runFixture('function-executions').then(({locations}) => {
    const functionLocations = locations.filter(isFunction);
    t.equal(functionLocations.length, 3);
    t.equal(functionLocations[0].count, 0);
    t.equal(functionLocations[1].count, 1);
    t.equal(functionLocations[2].count, 2);
  });
});

//
// Fat arrow functions
// --------------------

test('coverage should count fat arrow function declarations', t => {
  t.plan(3);
  runFixture('function-arrow-fat-declarations').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    t.equal(statementLocations.length, 2);
    t.equal(statementLocations[0].count, 1);
    t.equal(statementLocations[1].count, 1);
  });
});

test('coverage should count fat arrow function executions', t => {
  t.plan(3);
  runFixture('function-arrow-fat-executions').then(({locations}) => {
    const functionLocations = locations.filter(isFunction);
    t.equal(functionLocations.length, 2);
    t.equal(functionLocations[0].count, 0);
    t.equal(functionLocations[1].count, 3);
  });
});
