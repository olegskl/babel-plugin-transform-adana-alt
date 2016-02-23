/* eslint-disable no-use-before-define */
import {types as t} from 'babel-core';

function astifyArray(arr) {
  return t.arrayExpression(arr.map(astify));
}

function astifyObject(obj) {
  return t.objectExpression(Object.keys(obj).map(key => {
    return t.objectProperty(t.identifier(key), astify(obj[key]));
  }));
}

export default function astify(any) {
  if (t.isNode(any)) {
    return any;
  }
  if (typeof any === 'number') {
    return t.numericLiteral(any);
  }
  if (typeof any === 'string') {
    return t.stringLiteral(any);
  }
  if (Array.isArray(any)) {
    return astifyArray(any);
  }
  if (any && typeof any === 'object') {
    return astifyObject(any);
  }
}
