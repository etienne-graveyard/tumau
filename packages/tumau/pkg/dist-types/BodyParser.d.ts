import { Middleware } from './Middleware';
export declare const BodyParser: {
    create: typeof createBodyParser;
};
declare function createBodyParser(): Middleware;
export {};
