export interface ContentTypeObject {
  type: string;
  parameters?: ContentTypeParameters;
}

export interface ContentTypeParameters {
  charset?: string;
  [key: string]: string | undefined;
}

export const ContentType = {
  Html: 'text/html',
  Json: 'application/json',
  Text: 'text/plain',
  GraphQL: 'application/graphql',
} as const;

export type ContentType = typeof ContentType[keyof typeof ContentType];

export const ContentTypeCharset = {
  Utf8: 'utf-8',
} as const;

export type ContentTypeCharset = typeof ContentTypeCharset[keyof typeof ContentTypeCharset];
