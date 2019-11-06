export type LimitStrategyReturn<T> = {
  next: T;
  allowed: boolean;
  expireAt: number | null;
};

export type LimitStrategy<T> = (prev: T | undefined, t: number) => LimitStrategyReturn<T>;

export const LimitStrategy = {
  MaxCount,
  MaxByPeriod,
  Penalize,
};

function MaxCount(max: number): LimitStrategy<{ count: number }> {
  return (prev = { count: 0 }) => {
    const nextCount = prev.count + 1;
    return {
      next: { count: nextCount },
      allowed: prev.count < max,
      expireAt: null,
    };
  };
}

function MaxByPeriod(max: number, period: number): LimitStrategy<{ count: number; periodEnd: number }> {
  return (prev, t) => {
    const periodEnded = prev && prev.periodEnd < t;
    if (!prev || periodEnded) {
      return {
        next: { count: 1, periodEnd: t + period },
        allowed: true,
        expireAt: t + period,
      };
    }
    const nextCount = prev.count + 1;
    return {
      next: { count: nextCount, periodEnd: prev.periodEnd },
      allowed: prev.count < max,
      expireAt: prev.periodEnd,
    };
  };
}

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
function Penalize(options: PenalizeOptions): LimitStrategy<PenalizeState> {
  const { limit, period, maxPenalty = 10, penaltyPeriod = period } = options;

  return (prev, t) => {
    if (prev === undefined) {
      return {
        next: {
          count: 1,
          penalty: 0,
          periodEnd: t + period,
          penaltyEnd: 0,
        },
        allowed: true,
        expireAt: t + period,
      };
    }
    const inPenaltyPeriod = t < prev.penaltyEnd;
    const limiteHit = prev.count + 1 > limit;
    if (inPenaltyPeriod || limiteHit) {
      const nextPenalty = Math.min(maxPenalty, prev.penalty + 1);
      const penaltyEnd = t + penaltyPeriod * nextPenalty;
      return {
        next: {
          count: 0,
          periodEnd: 0,
          penalty: nextPenalty,
          penaltyEnd,
        },
        allowed: false,
        expireAt: penaltyEnd,
      };
    }
    const periodEnded = prev && prev.periodEnd < t;
    if (periodEnded) {
      return {
        next: { count: 0, periodEnd: t + period, penalty: 0, penaltyEnd: 0 },
        allowed: true,
        expireAt: period,
      };
    }
    const nextCount = prev.count + 1;
    return {
      next: { count: nextCount, periodEnd: prev.periodEnd, penalty: 0, penaltyEnd: 0 },
      allowed: true,
      expireAt: null,
    };
  };
}
