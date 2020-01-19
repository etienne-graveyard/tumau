const PACKAGES = [
  { name: '@tumau/core', slug: 'core', path: 'packages/tumau-core' },
  { name: '@tumau/json', slug: 'json', path: 'packages/tumau-json' },
  { name: '@tumau/middleware', slug: 'middleware', path: 'packages/tumau-middleware' },
  // { name: '@tumau/core', path: 'packages/tumau-core', slug: 'core' },
  // { name: '@tumau/core', path: 'packages/tumau-core', slug: 'core' },
  // { name: '@tumau/core', path: 'packages/tumau-core', slug: 'core' },
  // { name: '@tumau/core', path: 'packages/tumau-core', slug: 'core' },
  // { name: '@tumau/core', path: 'packages/tumau-core', slug: 'core' },
];

module.exports = {
  exportTrailingSlash: false,
  // exportPathMap: async function() {
  //   const paths = {
  //     '/': { page: '/' },
  //   };
  //   PACKAGES.forEach(pkg => {
  //     paths[`/package/${pkg.slug}`] = { page: '/package/[slug]', query: { slug: pkg.slug } };
  //   });
  //   return paths;
  // },
};
