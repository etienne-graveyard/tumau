declare const AllHttpMethod: {
    GET: "GET";
    HEAD: "HEAD";
    PATCH: "PATCH";
    OPTIONS: "OPTIONS";
    DELETE: "DELETE";
    POST: "POST";
    PUT: "PUT";
};
export declare type HttpMethod = typeof AllHttpMethod[keyof typeof AllHttpMethod];
export declare const HttpMethod: {
    __ALL: Set<HttpMethod>;
    GET: "GET";
    HEAD: "HEAD";
    PATCH: "PATCH";
    OPTIONS: "OPTIONS";
    DELETE: "DELETE";
    POST: "POST";
    PUT: "PUT";
};
export {};
