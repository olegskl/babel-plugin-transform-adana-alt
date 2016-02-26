import test from 'tape';
import runFixture from './helpers/run';
import {isStatement} from './helpers/tag-assert';

//
// Continue statements
// --------------------

test('coverage should count continue statements', t => {
  t.plan(3);
  runFixture('continue-statements').then(({locations}) => {
    const statementLocations = locations.filter(isStatement);
    const executedOnceStatementLocations = statementLocations
      .filter(el => el.count === 1);
    const executedNeverStatementLocations = statementLocations
      .filter(el => el.count === 0);

    // There are 3 statements
    //  - one do-while statement
    //  - one continue statement
    //  - one expression-statement statement
    t.equal(statementLocations.length, 1 + 2);
    // Two statements have been run once (do-while and continue):
    t.equal(executedOnceStatementLocations.length, 2);
    // One statement is unreachable (expression statement):
    t.equal(executedNeverStatementLocations.length, 1);
  });
});
