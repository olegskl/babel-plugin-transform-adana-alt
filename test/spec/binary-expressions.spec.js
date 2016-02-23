import test from 'tape';
import runFixture from './helpers/run';
import {isExpression} from './helpers/tag-assert';

//
// Binary expressions
// --------------------

test('coverage should count binary expressions', t => {
  t.plan(2);
  runFixture('binary-expressions').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    t.equal(expressionLocations.length, 2);
    t.equal(expressionLocations.every(el => el.count === 1), true);
  });
});
