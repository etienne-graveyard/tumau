import { Context } from '@tumau/core';
import { CorsManager } from './CorsManager';

export const CorsContext = Context.create<CorsManager>();
export const CorsContextConsumer = CorsContext.Consumer;
