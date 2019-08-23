declare module 'autocannon' {
  type Method = 'GET' | 'POST' | 'PUT' | 'OPTION'; // TODO: add more

  interface Options {
    url: string;
    socketPath?: string;
    connections?: number;
    duration?: number;
    amount?: number;
    timeout?: number;
    pipelining?: number;
    bailout?: number;
    method?: Method;
    title?: string;
    body?: string | Buffer;
    headers?: any;
    setupClient?: (client: any) => any;
    maxConnectionRequests?: number;
    maxOverallRequests?: number;
    connectionRate?: number;
    overallRate?: number;
    reconnectRate?: number;
    requests?: Array<{ body?: string | Buffer; headers?: any; method?: Method }>;
    idReplacement?: boolean;
    forever?: boolean;
    servername?: string;
    excludeErrorStats?: boolean;
  }

  interface TrackOptions {
    outputStream?: NodeJS.WriteStream;
    renderProgressBar?: boolean;
    renderResultsTable?: boolean;
    renderLatencyTable?: boolean;
    progressBarString?: string;
  }

  function Autocannon(opts: Options): Promise<any>;
  function Autocannon(opts: Options, cb: (error: any, result: any) => any): Autocannon.Instance;

  namespace Autocannon {
    export function track(instance: Autocannon.Instance, opts?: TrackOptions): void;
    export interface Instance {
      stop(): void;
    }
  }

  export = Autocannon;
}
