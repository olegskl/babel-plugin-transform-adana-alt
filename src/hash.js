import {createHash} from 'crypto';

export default function hash(code) {
  return createHash('sha1').update(code).digest('hex');
}
