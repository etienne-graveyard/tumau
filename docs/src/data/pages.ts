export type Page = typeof PAGES[number];

export type Slug = Page['slug'];

export const PAGES = [
  {
    page: '/',
    slug: '/',
    name: 'Tumau',
    file: 'README.md',
  },
  {
    page: '/package/[slug]',
    slug: '/package/core',
    name: '@tumau/core',
    file: 'packages/tumau-core/README.md',
  },
  {
    page: '/package/[slug]',
    slug: '/package/url-parser',
    name: '@tumau/url-parser',
    file: 'packages/tumau-url-parser/README.md',
  },
  {
    page: '/package/[slug]',
    slug: '/package/router',
    name: '@tumau/router',
    file: 'packages/tumau-router/README.md',
  },
  {
    page: '/package/[slug]',
    slug: '/package/json',
    name: '@tumau/json',
    file: 'packages/tumau-json/README.md',
  },
  {
    page: '/package/[slug]',
    slug: '/package/compress',
    name: '@tumau/compress',
    file: 'packages/tumau-compress/README.md',
  },
  {
    page: '/package/[slug]',
    slug: '/package/cookie',
    name: '@tumau/cookie',
    file: 'packages/tumau-cookie/README.md',
  },
  {
    page: '/package/[slug]',
    slug: '/package/cors',
    name: '@tumau/cors',
    file: 'packages/tumau-cors/README.md',
  },
] as const;
