import test from 'tape';
import runFixture from './helpers/run';
import {isExpression} from './helpers/tag-assert';

//
// Update expressions
// --------------------

test('coverage should count update expressions', t => {
  t.plan(2);
  runFixture('update-expressions').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    t.equal(expressionLocations.length, 2);
    t.equal(expressionLocations.every(el => el.count === 1), true);
  }).catch(e => console.error(e.stack));
});
