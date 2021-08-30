export declare const ContentEncoding: {
    readonly Brotli: "br";
    readonly Deflate: "deflate";
    readonly Gzip: "gzip";
    readonly Identity: "identity";
};
export declare type ContentEncoding = typeof ContentEncoding[keyof typeof ContentEncoding];
