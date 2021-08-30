import { LimitStrategy } from './LimitStrategy';
export interface GlobalRateLimit<S> {
    hit: () => S;
}
export interface RateLimit<K, S> {
    hit: (val: K) => S;
}
export declare const RateLimit: {
    createByIp: typeof createByIp;
    createGlobal: typeof createGlobal;
    create: typeof create;
};
export interface RateLimitOptions<K, S> {
    errorMessage?: (key: K, state: S) => string;
    strategy: LimitStrategy<S>;
    storeCleanupSize?: number;
}
export interface GlobalRateLimitOptions<S> {
    errorMessage?: (state: S) => string;
    strategy: LimitStrategy<S>;
    storeCleanupSize?: number;
}
declare function create<K, S>(options: RateLimitOptions<K, S>): RateLimit<K, S>;
declare function createGlobal<S>(options: GlobalRateLimitOptions<S>): GlobalRateLimit<S>;
declare function createByIp<S>(options: RateLimitOptions<string, S>): RateLimit<string, S>;
export {};
