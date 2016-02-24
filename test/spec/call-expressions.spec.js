import test from 'tape';
import runFixture from './helpers/run';
import {isExpression} from './helpers/tag-assert';

//
// Call expressions
// --------------------

test('coverage should count class declarations', t => {
  t.plan(2);
  runFixture('call-expressions').then(({locations}) => {
    const expressionLocations = locations.filter(isExpression);
    const executedOnceExpressionLocations = expressionLocations
      .filter(el => el.count === 1);

    // There is one expression:
    t.equal(expressionLocations.length, 1);
    // The expression has been executed once:
    t.equal(executedOnceExpressionLocations.length, 1);
  });
});
