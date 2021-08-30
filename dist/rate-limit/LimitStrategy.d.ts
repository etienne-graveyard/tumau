export declare type LimitStrategyReturn<T> = {
    next: T;
    allowed: boolean;
    expireAt: number | null;
};
export declare type LimitStrategy<T> = (prev: T | undefined, t: number) => LimitStrategyReturn<T>;
export declare const LimitStrategy: {
    MaxCount: typeof MaxCount;
    MaxByPeriod: typeof MaxByPeriod;
    Penalize: typeof Penalize;
};
declare function MaxCount(max: number): LimitStrategy<{
    count: number;
}>;
declare function MaxByPeriod(max: number, period: number): LimitStrategy<{
    count: number;
    periodEnd: number;
}>;
interface PenalizeOptions {
    limit: number;
    period: number;
    penaltyPeriod?: number;
    maxPenalty?: number;
}
interface PenalizeState {
    count: number;
    periodEnd: number;
    penalty: number;
    penaltyEnd: number;
}
/**
 * When the limit is hit it return a 429, penalty is increased by 1
 * and you have to wait penalty * penaltyPeriod before another request is accepeted
 * If a request is made during the penalty period, it return a 429, is increased by 1
 * and the penalty period is reset to penalty * penaltyPeriod
 * If a request come after the penalty period you're back to limit over period
 */
declare function Penalize(options: PenalizeOptions): LimitStrategy<PenalizeState>;
export {};
