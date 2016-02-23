import test from 'tape';
import runFixture from './helpers/run';
import {isExpression} from './helpers/tag-assert';

//
// Variable declarations
// --------------------

test('coverage should count variable declarations', t => {
  t.plan(2);
  runFixture('variable-declarations').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    t.equal(expressionLocations.length, 9);
    t.equal(expressionLocations.every(el => el.count === 1), true);
  });
});
