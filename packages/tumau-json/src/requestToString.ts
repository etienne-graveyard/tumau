import { IncomingMessage } from 'http';
import { StringDecoder } from 'string_decoder';
import { HttpError } from '@tumau/core';

export function requestToString(stream: IncomingMessage, limit: number): Promise<string> {
  return new Promise<string>((resolve, reject): void => {
    // State
    let complete = false;
    let received = 0;
    let buffer = '';
    let sync = true;

    const decoder = new StringDecoder('utf8');

    // Utils

    const done = (err: unknown, data?: string): void => {
      // mark complete
      complete = true;

      const invokeCallback = (): void => {
        onClose();

        if (err) {
          // halt the stream on error
          stream.unpipe();
          stream.pause();
          return reject(err);
        }

        resolve(data);
      };

      if (sync) {
        process.nextTick(invokeCallback);
      } else {
        invokeCallback();
      }
    };

    // Listeners

    const onAborted = (): void => {
      if (complete) {
        return;
      }
      done(new Error('request aborted'));
    };

    const onData = (chunk: Buffer): void => {
      if (complete) {
        return;
      }
      received += chunk.length;
      if (received > limit) {
        done(new HttpError.PayloadTooLarge());
      } else {
        buffer += decoder.write(chunk);
      }
    };

    const onEnd = (err: unknown): void => {
      if (complete) {
        return;
      }
      if (err) {
        return done(err);
      }

      const output = buffer + decoder.end();
      done(null, output);
    };

    const onClose = (): void => {
      buffer = '';

      stream.removeListener('aborted', onAborted);
      stream.removeListener('data', onData);
      stream.removeListener('end', onEnd);
      stream.removeListener('error', onEnd);
      stream.removeListener('close', onClose);
    };

    // attach listeners
    stream.on('aborted', onAborted);
    stream.on('close', onClose);
    stream.on('data', onData);
    stream.on('end', onEnd);
    stream.on('error', onEnd);

    // mark sync section complete
    sync = false;
  });
}
