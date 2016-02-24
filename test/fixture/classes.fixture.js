/* eslint-disable no-unused-vars */

// one statement
class A {
  static s = 0; // one expression
  p = 1; // one expression
  constructor() {
    // one class, executed twice (see below)
  }
  foo() {
    // one function, executed once (see below)
  }
}

// one statement
new A(); // expression not covered

// one statement
const a = new A(); // two expressions, one not covered
// one statement
a.foo(); // one expression
