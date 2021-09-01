import { createContext } from '../core';

export type Logger = {
  log(...data: Array<any>): void;
  error(...data: Array<any>): void;
  info(...data: Array<any>): void;
  warn(...data: Array<any>): void;
};

export const LoggerContext = createContext<Logger>({
  name: 'Logger',
  defaultValue: {
    error: console.error,
    info: console.info,
    log: console.log,
    warn: console.warn,
  },
});
export const LoggerConsumer = LoggerContext.Consumer;
