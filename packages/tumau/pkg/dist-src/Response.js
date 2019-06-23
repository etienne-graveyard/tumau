export const Response = {
    create: createResponse,
};
async function createResponse(res) {
    const response = {
        res,
        send,
    };
    return response;
    function send(options = {}) {
        const { code = 200, headers = {}, json = { enpty: true } } = options;
        const obj = {};
        for (let k in headers) {
            obj[k.toLowerCase()] = headers[k];
        }
        const dataStr = JSON.stringify(json);
        obj['content-type'] = obj['content-type'] || res.getHeader('content-type') || 'application/json;charset=utf-8';
        obj['content-length'] = Buffer.byteLength(dataStr);
        res.writeHead(code, obj);
        res.end(dataStr);
    }
}
