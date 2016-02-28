/* eslint-disable no-unused-vars */

// one statement
class A {
  static s = // one statement
    0; // one expression
  p = // one statement (executed twice)
    1; // one expression (executed twice)
  constructor() { // one statement
    // one constructor function (executed twice)
  }
  foo() { // one statement
    // one method function
  }
}

// one statement
new A(); // two expressions

// one statement
const a = new A(); // two expressions
// one statement
a.foo(); // three expressions
