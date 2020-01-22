import koa from 'koa';

export async function mountKoa(app: koa): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise(resolve => {
    const server = app.listen(undefined, async () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        throw new Error('Whut ?');
      }
      resolve({
        url: `http://localhost:${address.port}`,
        close: () => {
          return new Promise(resolve => {
            server.close(() => {
              resolve();
            });
          });
        },
      });
    });
  });
}
