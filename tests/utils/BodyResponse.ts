import { IncomingMessage } from 'http';
import { readStream } from './readStream';

export const BodyResponse = {
  asText,
};

async function asText(res: IncomingMessage): Promise<string> {
  const str = await readStream(res);
  return str;
}
