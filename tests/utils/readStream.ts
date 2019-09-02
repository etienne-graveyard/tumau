import { StringDecoder } from 'string_decoder';
import { Readable } from 'stream';

const _1mb = 1024 * 1024 * 1024;

export function readStream(res: Readable, limit: number = _1mb): Promise<string> {
  return new Promise<string>((resolve, reject): void => {
    let complete = false;
    let sync = true;
    let received = 0;
    let buffer = '';

    const decoder = new StringDecoder('utf8');

    // attach listeners
    res.on('aborted', onAborted);
    res.on('close', cleanup);
    res.on('data', onData);
    res.on('end', onEnd);
    res.on('error', onEnd);

    // mark sync section complete
    sync = false;

    function done(err: unknown, data?: string): void {
      // mark complete
      complete = true;

      if (sync) {
        process.nextTick(invokeCallback);
      } else {
        invokeCallback();
      }

      function invokeCallback(): void {
        cleanup();

        if (err) {
          // halt the stream on error
          res.unpipe();
          res.pause();
          return reject(err);
        }

        resolve(data);
      }
    }

    function onAborted(): void {
      if (complete) {
        return;
      }
      done(new Error('request aborted'));
    }

    function onData(chunk: Buffer): void {
      if (complete) {
        return;
      }
      received += chunk.length;
      if (received > limit) {
        done(new Error('PayloadTooLarge'));
      } else {
        buffer += decoder.write(chunk);
      }
    }

    function onEnd(err: unknown): void {
      if (complete) {
        return;
      }
      if (err) {
        return done(err);
      }
      const string = buffer + decoder.end();
      done(null, string);
    }

    function cleanup(): void {
      buffer = '';

      res.removeListener('aborted', onAborted);
      res.removeListener('data', onData);
      res.removeListener('end', onEnd);
      res.removeListener('error', onEnd);
      res.removeListener('close', cleanup);
    }
  });
}
