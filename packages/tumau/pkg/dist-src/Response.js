import { HttpStatus } from './HttpStatus';
import { HttpMethod } from './HttpMethod';
import { HttpHeaders, ContentType } from './HttpHeaders';
export const Response = {
    create: createResponse,
};
async function createResponse(res) {
    let responseData = null;
    const response = {
        res,
        create,
        get sent() {
            return responseData !== null;
        },
        clearBody,
        __send,
    };
    return response;
    function create(options = {}, config = {}) {
        const { force = false } = config;
        if (responseData !== null && force === false) {
            throw new Error(`responseData already set !`);
        }
        const { code = 200, headers = {}, json = {} } = options;
        responseData = {
            code,
            headers,
            json,
        };
    }
    function clearBody() {
        if (responseData) {
            delete responseData.json;
        }
    }
    function __send(ctx) {
        if (res.finished) {
            throw new Error('Response finished ?');
        }
        if (responseData === null) {
            throw new Error('No response sent !');
        }
        if (res.headersSent) {
            throw new Error('Header already sent !');
        }
        const headers = {
            ...responseData.headers,
        };
        const isEmpty = HttpStatus.isEmpty(responseData.code) ||
            ctx.request.method === HttpMethod.HEAD ||
            ctx.request.method === HttpMethod.OPTIONS;
        const bodyStr = JSON.stringify(responseData.json);
        const length = Buffer.byteLength(bodyStr);
        // ignore body
        if (isEmpty === false) {
            headers[HttpHeaders.ContentLength] = length;
            headers[HttpHeaders.ContentType] = ContentType.Json;
        }
        res.writeHead(responseData.code, headers);
        if (isEmpty) {
            return res.end();
        }
        return res.end(bodyStr);
    }
}
