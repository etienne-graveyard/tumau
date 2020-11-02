/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'tumau';

// here we could omit <number> because it would be infered
const NumCtx = createContext<number>(0);

// you can omit the default value
const NameCtx = createContext<string>();
