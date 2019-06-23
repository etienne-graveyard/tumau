import { Middleware } from './Middleware';
export declare const BodyParser: {
    create: typeof createBodyParser;
};
interface Options {
    limit?: number;
}
declare function createBodyParser(options?: Options): Middleware;
export {};
