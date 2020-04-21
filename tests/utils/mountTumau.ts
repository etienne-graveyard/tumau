import { TumauServer } from '@tumau/core';

export async function mountTumau(app: TumauServer): Promise<{ url: string; port: number; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    app.listen(undefined, async () => {
      const address = app.httpServer.address();
      if (address === null || typeof address === 'string') {
        throw new Error('Whut ?');
      }
      resolve({
        url: `http://localhost:${address.port}`,
        port: address.port,
        close: () => {
          return new Promise((resolve) => {
            app.httpServer.close(() => {
              resolve();
            });
          });
        },
      });
    });
  });
}
