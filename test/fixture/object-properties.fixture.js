/* eslint-disable no-undef, no-unused-vars, quote-props */
const a = 'a'; // 'a' is an expression
const foo = {
  a, // shorthand property, one expression
  b: 'b', // static property key, one expression
  'c': 'c', // static quoted property key, one expression
  ['d']: 'd' // computed property key, two expressions
};
