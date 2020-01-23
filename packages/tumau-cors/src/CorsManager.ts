import { CorsConfig } from './CorsConfig';

type UpdateCors = (cors: CorsConfig) => CorsConfig;

export interface CorsManager {
  readonly current: Readonly<CorsConfig>;
  update: (cors: Partial<CorsConfig> | UpdateCors) => CorsConfig;
}

export const CorsManager = {
  create: (initial: CorsConfig): CorsManager => {
    let current: CorsConfig = initial;
    return {
      get current() {
        return current;
      },
      update(cors: Partial<CorsConfig> | UpdateCors): CorsConfig {
        const updateFn: UpdateCors = typeof cors === 'function' ? cors : (prev: CorsConfig) => ({ ...prev, ...cors });
        current = updateFn(current);
        return current;
      },
    };
  },
};
