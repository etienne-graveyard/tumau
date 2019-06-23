import { StringDecoder } from 'string_decoder';
import { HttpMethod } from './HttpMethod';
import { HttpHeaders, ContentType, ContentEncoding } from './HttpHeaders';
import { HttpErrors } from './HttpErrors';
export const BodyParser = {
    create: createBodyParser,
};
function createBodyParser(options = {}) {
    const _1mb = 1024 * 1024 * 1024;
    const { limit = _1mb } = options;
    // Allowed whitespace is defined in RFC 7159
    // http://www.rfc-editor.org/rfc/rfc7159.txt
    const strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/;
    return async (ctx, next) => {
        const headers = ctx.request.headers;
        if (ctx.request.method === HttpMethod.GET ||
            ctx.request.method === HttpMethod.DELETE ||
            ctx.request.method === HttpMethod.OPTIONS) {
            return next();
        }
        const lengthStr = headers[HttpHeaders.ContentLength];
        if (lengthStr === undefined || Array.isArray(lengthStr)) {
            throw new HttpErrors.LengthRequired();
        }
        const length = parseInt(lengthStr, 10);
        if (Number.isNaN(length)) {
            throw new HttpErrors.LengthRequired();
        }
        if (length === 0) {
            return next();
        }
        const type = headers[HttpHeaders.ContentType];
        if (type !== ContentType.Json) {
            throw new HttpErrors.NotAcceptable('Only application/json is accepeted');
        }
        const encoding = headers[HttpHeaders.ContentEncoding] || ContentEncoding.Identity;
        if (encoding !== ContentEncoding.Identity) {
            throw new HttpErrors.NotAcceptable(`${encoding} not supported`);
        }
        if (length > limit) {
            throw new HttpErrors.PayloadTooLarge();
        }
        const body = await parseBody(ctx.request.req, length, limit);
        ctx.request.body = body;
        return next();
    };
    async function parseBody(req, length, limit) {
        const str = await readStream(req, length, limit);
        if (!str) {
            return {};
        }
        // strict JSON test
        if (!strictJSONReg.test(str)) {
            throw new Error('invalid JSON, only supports object and array');
        }
        return JSON.parse(str);
    }
    function readStream(stream, length, limit) {
        return new Promise((resolve, reject) => {
            let complete = false;
            let sync = true;
            let received = 0;
            let buffer = '';
            const decoder = new StringDecoder('utf8');
            // attach listeners
            stream.on('aborted', onAborted);
            stream.on('close', cleanup);
            stream.on('data', onData);
            stream.on('end', onEnd);
            stream.on('error', onEnd);
            // mark sync section complete
            sync = false;
            function done(err, data) {
                // mark complete
                complete = true;
                if (sync) {
                    process.nextTick(invokeCallback);
                }
                else {
                    invokeCallback();
                }
                function invokeCallback() {
                    cleanup();
                    if (err) {
                        // halt the stream on error
                        stream.unpipe();
                        stream.pause();
                        return reject(err);
                    }
                    resolve(data);
                }
            }
            function onAborted() {
                if (complete) {
                    return;
                }
                done(new Error('request aborted'));
            }
            function onData(chunk) {
                if (complete) {
                    return;
                }
                received += chunk.length;
                if (received > limit) {
                    done(new HttpErrors.PayloadTooLarge());
                }
                else {
                    buffer += decoder.write(chunk);
                }
            }
            function onEnd(err) {
                if (complete) {
                    return;
                }
                if (err) {
                    return done(err);
                }
                if (received !== length) {
                    done(new HttpErrors.HttpError(400, 'Request size did not match content length'));
                }
                else {
                    var string = buffer + decoder.end();
                    done(null, string);
                }
            }
            function cleanup() {
                buffer = '';
                stream.removeListener('aborted', onAborted);
                stream.removeListener('data', onData);
                stream.removeListener('end', onEnd);
                stream.removeListener('error', onEnd);
                stream.removeListener('close', cleanup);
            }
        });
    }
}
