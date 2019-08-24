import http from 'http';
import { Server } from '@tumau/core';
import { Request } from './Request';
import koa from 'koa';

export async function runTumauRequest(app: Server, request: Request): Promise<http.IncomingMessage> {
  return new Promise(resolve => {
    app.listen(0, () => {
      resolve(runRequest(app.httpServer, request));
    });
  });
}

export async function runKoaRequest(app: koa, request: Request): Promise<http.IncomingMessage> {
  return new Promise(resolve => {
    const server = app.listen(0, () => {
      resolve(runRequest(server, request));
    });
  });
}

async function runRequest(server: http.Server, request: Request): Promise<http.IncomingMessage> {
  const addr = await ensureServerIsListening(server);
  return new Promise(resolve => {
    const url = addr + request.path;
    http
      .request(
        url,
        {
          method: request.method,
          headers: request.headers,
        },
        res => {
          server.close();
          resolve(res);
        }
      )
      .end();
  });
}

async function ensureServerIsListening(server: http.Server): Promise<string> {
  const addr = server.address();
  if (addr) {
    if (typeof addr !== 'string') {
      return `http://127.0.0.1:${addr.port}`;
    }
    return addr;
  }
  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      const addr = server.address();
      if (!addr) {
        return reject(new Error('No adress() after listening !'));
      }
      if (typeof addr !== 'string') {
        return resolve(`http://127.0.0.1:${addr.port}`);
      }
      return resolve(addr);
    });
  });
}
