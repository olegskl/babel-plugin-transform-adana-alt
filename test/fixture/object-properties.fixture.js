/* eslint-disable no-undef, no-unused-vars, quote-props */
const a = 'a'; // <- one expression not related to this test, but unavoidable, see below
const foo = { // <- one expression not related to this test, but unavoidable
  a, // shorthand property, one expression
  b: 'b', // static property key, one expression
  'c': 'c', // static quoted property key, one expression
  ['d']: 'd' // computed property key, two expressions
};
