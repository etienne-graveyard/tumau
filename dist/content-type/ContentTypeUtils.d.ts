import { ContentTypeObject } from './ContentType';
export declare const ContentTypeUtils: {
    parse: typeof parse;
    format: typeof format;
};
declare function format(obj: ContentTypeObject): string;
declare function parse(string: string): ContentTypeObject;
export {};
