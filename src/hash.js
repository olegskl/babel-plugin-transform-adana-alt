/* eslint-disable no-bitwise */

/**
 * Generates a lossy hash.
 * This is a variation of the FNV algorithm.
 * @see https://gist.github.com/copy/69e24bc8b9b75943c5f861f00db18507
 * @param  {String} str A value to hash.
 * @return {String}     Generated hash.
 */
export function fnv(str) {
  let hash = 2166136261;

  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = hash * 16777619 | 0;
  }

  return (hash >>> 0).toString(36);
}
