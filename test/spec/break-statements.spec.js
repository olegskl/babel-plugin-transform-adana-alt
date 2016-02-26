import test from 'tape';
import runFixture from './helpers/run';
import {isStatement} from './helpers/tag-assert';

//
// Break statements
// --------------------

test('coverage should count break statements', t => {
  t.plan(2);
  runFixture('break-statements').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    const executedOnceStatementLocations = statementLocations
      .filter(el => el.count === 1);

    // There are two statements (one for while-statement, one for break statement):
    t.equal(statementLocations.length, 2);
    // Both statements have been run once:
    t.equal(executedOnceStatementLocations.length, 2);
  });
});
