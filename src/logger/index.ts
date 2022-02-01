import { createKey } from '../core';

export type Logger = {
  log(...data: Array<any>): void;
  error(...data: Array<any>): void;
  info(...data: Array<any>): void;
  warn(...data: Array<any>): void;
};

const IS_TEST = process.env.NODE_ENV === 'test';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const LoggerContext = createKey<Logger>({
  name: 'Logger',
  defaultValue: {
    error: IS_TEST ? noop : console.error,
    info: IS_TEST ? noop : console.info,
    log: IS_TEST ? noop : console.log,
    warn: IS_TEST ? noop : console.warn,
  },
});

export const LoggerConsumer = LoggerContext.Consumer;
