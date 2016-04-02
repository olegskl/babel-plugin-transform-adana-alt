/* eslint-disable no-undef, no-unused-vars */

const VARIABLE = (context => {
  const locations = JSON.parse(LOCATIONS);
  context[NAMESPACE] = context[NAMESPACE] || {};
  context[NAMESPACE][FILEPATH] = {
    path: FILEPATH,
    locations
  };
  return index => {
    locations[index].count += 1;
  };
})(
  typeof global === 'undefined' ? window : global
);
