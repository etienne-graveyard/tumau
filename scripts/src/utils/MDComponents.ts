import * as R from 'runtypes';

function createComponent<P>(propsTypes: R.Runtype<P>, component: (props: P) => string): (props: any) => string {
  return (props: any) => {
    const typed = propsTypes.check(props);
    return component(typed);
  };
}

export const Image = createComponent(
  R.Record({
    src: R.String,
    alt: R.String,
    center: R.Boolean.Or(R.Undefined),
  }),
  ({ center = false, alt, src }) => {
    const link = `![${alt}](${src})`;
    if (center) {
      return [`<p align="center">`, ``, link, ``, `</p>`].join('\n');
    }
    return link;
  }
);

export const Title = createComponent(R.Record({ children: R.Tuple(R.String) }), ({ children }) => {
  return `# ${children[0]}`;
});

export const Subtitle = createComponent(R.Record({ children: R.Tuple(R.String) }), ({ children }) => {
  return `## ${children[0]}`;
});

export const H3 = createComponent(R.Record({ children: R.Tuple(R.String) }), ({ children }) => {
  return `### ${children[0]}`;
});

export const Quote = createComponent(R.Record({ children: R.Tuple(R.String) }), ({ children }) => {
  return `> ${children[0]}`;
});

export const Link = createComponent(R.Record({ children: R.Tuple(R.String), href: R.String }), ({ children, href }) => {
  return `[${children[0]}](${href})`;
});

export const Code = createComponent(R.Record({ children: R.Tuple(R.String), lang: R.String }), ({ children, lang }) => {
  return ['```' + lang, children[0], '```'].join('');
});

export const LI = createComponent(R.Record({ children: R.Array(R.String) }), ({ children }) => {
  return `- ${children.join('')}`;
});

export const List = createComponent(R.Record({ children: R.Array(R.String) }), ({ children }) => {
  return children.join('').replace(/^\n+/, '').replace(/\n+$/, '');
});

export const InlineCode = createComponent(R.Record({ children: R.Tuple(R.String) }), ({ children }) => {
  return '`' + children[0] + '`';
});

export const PackageLink = createComponent(R.Record({ package: R.String }), ({ package: pkg }) => {
  const LINKS = {
    '@tumau/core': 'https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-core',
    '@tumau/router': 'https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-router',
    '@tumau/url-parser': 'https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-url-parser',
    '@tumau/json': 'https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-json',
    '@tumau/compress': 'https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-compress',
    '@tumau/cookie': 'https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-cookie',
    '@tumau/ws': 'https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-ws',
    '@tumau/cors': 'https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-cors',
  };
  const link = (LINKS as any)[pkg];
  if (!link) {
    throw new Error(`Mising link for ${pkg}`);
  }

  return `[${'`' + `${pkg}` + '`'}](${link})`;
});

export const Note = createComponent(R.Record({ children: R.Array(R.String) }), ({ children }) => {
  return `**Note**: ${children
    .join('')
    .replace(/^[\n ]+/, '')
    .replace(/[\n ]+$/, '')}`;
});

export const Comment = createComponent(R.Record({ children: R.Array(R.String) }), ({ children }) => {
  return `<!-- ${children.join('')} -->`;
});
