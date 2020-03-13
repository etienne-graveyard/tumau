export const ContentEncoding = {
  Brotli: 'br',
  Deflate: 'deflate',
  Gzip: 'gzip',
  Identity: 'identity',
} as const;

export type ContentEncoding = typeof ContentEncoding[keyof typeof ContentEncoding];
