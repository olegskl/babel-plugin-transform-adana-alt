/* eslint-disable no-undef, no-unused-vars, quote-props */

const a = 'a'; // <- one expression not related to this test, but unavoidable, see below
const foo = { // <- one expression not related to this test, but unavoidable
  a, // shorthand property, two expressions
  b: 'b', // static property key, two expressions
  'c': 'c', // static quoted property key, two expressions
  ['d']: 'd' // computed property key, two expressions
};
