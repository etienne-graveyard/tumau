export interface ContentTypeObject {
    type: string;
    parameters?: ContentTypeParameters;
}
export interface ContentTypeParameters {
    charset?: string;
    [key: string]: string | undefined;
}
export declare const ContentType: {
    readonly Html: "text/html";
    readonly Json: "application/json";
    readonly Text: "text/plain";
    readonly GraphQL: "application/graphql";
};
export declare type ContentType = typeof ContentType[keyof typeof ContentType];
export declare const ContentTypeCharset: {
    readonly Utf8: "utf-8";
};
export declare type ContentTypeCharset = typeof ContentTypeCharset[keyof typeof ContentTypeCharset];
