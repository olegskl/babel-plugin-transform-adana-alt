import test from 'tape';
import runFixture from './helpers/run';
import {isExpression} from './helpers/tag-assert';

//
// Object properties
// --------------------

test('coverage should count object properties', t => {
  t.plan(2);
  runFixture('object-properties').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    t.equal(expressionLocations.length, 5 + 2); // extra 2 come from var declarations
    t.equal(expressionLocations.every(el => el.count === 1), true);
  });
});

test('coverage should count object methods', t => {
  t.plan(2);
  runFixture('object-methods').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    t.equal(expressionLocations.length, 2 + 1); // extra 1 comes from var declaration
    t.equal(expressionLocations.every(el => el.count === 1), true);
  });
});
