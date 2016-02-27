/* eslint-disable no-undef, no-unused-vars */

// one statement
const obj = { // one expression not related to this test
  foo() {}, // shorthand property, one expression, one function
  ['bar']() {} // computed shorthand property, one expression, one function
};

// one statement
obj.bar(); // three expressions
