import fs from 'fs';
import path from 'path';
import test from 'tape';
import hash from '../../src/hash';
import runFixture from './helpers/run';

const fixturePath = path.resolve(__dirname, '../fixture/empty.fixture.js');

test('coverage should have a valid hash string', t => {
  t.plan(1);
  runFixture('empty').then(fileCoverage => {
    fs.readFile(fixturePath, 'utf8', (err, code) => {
      if (err) {
        t.fail(`Error reading fixture file: ${err.message}`);
      } else {
        t.equal(fileCoverage.hash, hash(code));
      }
    });
  });
});

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
