import { HTTPMethod } from './HTTPMethod';
import { StringDecoder } from 'string_decoder';
export const BodyParser = {
    create: createBodyParser,
};
function createBodyParser() {
    return async (ctx, next) => {
        if (ctx.request.method === HTTPMethod.GET || ctx.request.method === HTTPMethod.DELETE) {
            return next();
        }
        const _1mb = 1024 * 1024 * 1024;
        const body = await parseBody(ctx.request.req, { limit: _1mb });
        ctx.request.body = body;
        return next();
    };
}
// Allowed whitespace is defined in RFC 7159
// http://www.rfc-editor.org/rfc/rfc7159.txt
const strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/;
async function parseBody(req, options) {
    // defaults
    const len = req.headers['content-length'];
    const encoding = req.headers['content-encoding'] || 'identity';
    if (encoding !== 'identity') {
        throw new Error('Supports only identity');
    }
    const length = parseInt(len);
    const str = await raw(req, { limit: options.limit, length: length });
    if (!str) {
        return {};
    }
    // strict JSON test
    if (!strictJSONReg.test(str)) {
        throw new Error('invalid JSON, only supports object and array');
    }
    return JSON.parse(str);
}
function raw(stream, options) {
    return new Promise(function executor(resolve, reject) {
        readStream(stream, options.length, options.limit, function onRead(err, buf) {
            if (err)
                return reject(err);
            resolve(buf);
        });
    });
}
function halt(stream) {
    stream.unpipe();
    stream.pause();
}
function readStream(stream, length, limit, callback) {
    let complete = false;
    let sync = true;
    // check the length and limit options.
    // note: we intentionally leave the stream paused,
    // so users should handle the stream themselves.
    if (length > limit) {
        return done(new Error('request entity too large'));
    }
    const decoder = new StringDecoder('utf8');
    let received = 0;
    let buffer = '';
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
                halt(stream);
            }
            callback(null, data);
        }
    }
    function onAborted() {
        if (complete)
            return;
        done(new Error('request aborted'));
    }
    function onData(chunk) {
        if (complete)
            return;
        received += chunk.length;
        if (limit !== null && received > limit) {
            done(new Error('request entity too large'));
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
        if (length !== null && received !== length) {
            done(new Error('request size did not match content length'));
        }
        else {
            var string = buffer + decoder.end();
            done(null, string);
        }
    }
    function cleanup() {
        buffer = null;
        stream.removeListener('aborted', onAborted);
        stream.removeListener('data', onData);
        stream.removeListener('end', onEnd);
        stream.removeListener('error', onEnd);
        stream.removeListener('close', cleanup);
    }
}
