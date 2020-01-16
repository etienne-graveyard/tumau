/* eslint-disable @typescript-eslint/no-unused-vars */
import { Context } from 'tumau';

// here we could omit <number> because it would be infered
const NumCtx = Context.create<number>(0);

// you can omit the default value
const NameCtx = Context.create<string>();
