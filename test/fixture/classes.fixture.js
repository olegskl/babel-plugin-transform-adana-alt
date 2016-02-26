/* eslint-disable no-unused-vars */

// one statement
class A {
  static s = 0; // one expression (executed once)
  p = 1; // one expression (executed twice, see below)
  constructor() {
    // one class, executed twice (see below)
  }
  foo() {
    // one function, executed once (see below)
  }
}

// one statement
new A(); // two expressions

// one statement
const a = new A(); // two expressions
// one statement
a.foo(); // two expressions
