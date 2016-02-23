/* eslint-disable no-undef, no-unused-vars */
const VARIABLE = (context => {
  context[NAMESPACE] = context[NAMESPACE] || {};
  const fileCoverage = context[NAMESPACE][FILEPATH] = {
    hash: HASH,
    path: FILEPATH,
    locations: LOCATIONS
  };
  return fileCoverage.locations;
})(
  typeof global === 'undefined' ? this : global
);
