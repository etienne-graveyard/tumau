import http from 'http';
import { Server } from '@tumau/core';
import { Request } from './Request';

export async function ensureServerIsListening(app: Server): Promise<string> {
  const addr = app.httpServer.address();
  if (addr) {
    if (typeof addr !== 'string') {
      return `http://127.0.0.1:${addr.port}`;
    }
    return addr;
  }
  return new Promise((resolve, reject) => {
    app.listen(0, () => {
      const addr = app.httpServer.address();
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

export async function runRequest(app: Server, request: Request): Promise<http.IncomingMessage> {
  const addr = await ensureServerIsListening(app);
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
          app.httpServer.close();
          resolve(res);
        }
      )
      .end();
  });
}
