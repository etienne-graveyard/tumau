import { parse as parseQueryString } from 'querystring';
import { notNill } from './utils';
export const Request = {
    create: createRequest,
    parseUrl,
};
async function createRequest(req) {
    const url = notNill(req.url); // never null because IncomingMessage come from http.Server
    const parsed = parseUrl(url);
    const method = notNill(req.method);
    // const route = router.find(method, parsed.pathname);
    // const notFound = route.middlewares.length === 0;
    const request = {
        req,
        url,
        method,
        href: parsed.href,
        path: parsed.path,
        pathname: parsed.pathname,
        rawQuery: parsed.query,
        query: parsed.query ? parseQueryString(parsed.query) : null,
        search: parsed.search,
        body: {},
        headers: req.headers,
    };
    return request;
}
function parseUrl(url) {
    const obj = {
        query: null,
        search: null,
        _raw: url,
        href: url,
        path: url,
        pathname: url,
    };
    let idx = url.indexOf('?', 1);
    if (idx !== -1) {
        const search = url.substring(idx);
        obj.search = search;
        obj.query = search.substring(1);
        obj.pathname = url.substring(0, idx);
    }
    return obj;
}
// =======================
// =======================
// =======================
// =======================
// =======================
// =======================
// =======================
// =======================
// =======================
