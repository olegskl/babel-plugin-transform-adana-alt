import test from 'tape';
import runFixture from './helpers/run';
import {isExpression} from './helpers/tag-assert';

//
// Object properties
// --------------------

test.only('coverage should count object properties', t => {
  t.plan(2);
  runFixture('object-properties').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    t.equal(expressionLocations.length, 5);
    t.equal(expressionLocations.every(el => el.count === 1), true);
  });
});
