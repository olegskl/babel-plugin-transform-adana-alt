/* eslint-disable no-undef, no-unused-vars */

const VARIABLE = (context => {
  const locations = JSON.parse(LOCATIONS);
  context[NAMESPACE] = context[NAMESPACE] || {};
  context[NAMESPACE][FILEPATH] = {
    path: FILEPATH,
    locations
  };
  return (index, value) => {
    locations[index].count += 1;
    return value;
  };
})(
  typeof global === 'undefined' ? window : global
);
