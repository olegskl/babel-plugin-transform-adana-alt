import path from 'path';
import test from 'tape';
import runFixture from './helpers/run';

const fixturePath = path.resolve(__dirname, '../fixture/empty.fixture.js');

test('coverage should have a valid path string', t => {
  t.plan(1);
  runFixture('empty').then(fileCoverage => {
    t.equal(fileCoverage.path, fixturePath);
  });
});

test('coverage should have an empty locations array', t => {
  t.plan(2);
  runFixture('empty').then(fileCoverage => {
    t.equal(Array.isArray(fileCoverage.locations), true);
    t.equal(fileCoverage.locations.length, 0);
  });
});
