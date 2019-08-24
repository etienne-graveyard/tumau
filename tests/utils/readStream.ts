import { IncomingMessage } from 'http';
import { HttpHeaders, ContentEncoding } from '@tumau/core';
import { StringDecoder } from 'string_decoder';

const _1mb = 1024 * 1024 * 1024;

export function readStream(req: IncomingMessage, limit: number = _1mb): Promise<string> {
  const lengthStr = req.headers[HttpHeaders.ContentLength];
  if (lengthStr === undefined || Array.isArray(lengthStr)) {
    throw new Error('LengthRequired');
  }
  const length = parseInt(lengthStr, 10);
  if (Number.isNaN(length)) {
    throw new Error('LengthRequired');
  }
  if (length === 0) {
    return Promise.resolve('');
  }

  const encoding = req.headers[HttpHeaders.ContentEncoding] || ContentEncoding.Identity;
  if (encoding !== ContentEncoding.Identity) {
    throw new Error(`NotAcceptable: ${encoding} not supported`);
  }
  if (length > limit) {
    throw new Error('PayloadTooLarge');
  }

  return new Promise<string>((resolve, reject): void => {
    let complete = false;
    let sync = true;
    let received = 0;
    let buffer = '';

    const decoder = new StringDecoder('utf8');

    // attach listeners
    req.on('aborted', onAborted);
    req.on('close', cleanup);
    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onEnd);

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
          req.unpipe();
          req.pause();
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

      if (received !== length) {
        done(new Error('Request size did not match content length'));
      } else {
        var string = buffer + decoder.end();
        done(null, string);
      }
    }

    function cleanup(): void {
      buffer = '';

      req.removeListener('aborted', onAborted);
      req.removeListener('data', onData);
      req.removeListener('end', onEnd);
      req.removeListener('error', onEnd);
      req.removeListener('close', cleanup);
    }
  });
}
