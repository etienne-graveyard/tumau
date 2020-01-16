import React from 'react';
import { NextPage } from 'next';
import { PageData } from '../data';
import { MarkdownNodeRenderer } from '../components/MarkdownNodeRenderer';
import PACKAGES from '../data/packages.json';

type Props = PageData & {
  packages: ReadonlyArray<{ slug: string; name: string }>;
};

const Home: NextPage<Props> = ({ content }) => {
  return (
    <div>
      <MarkdownNodeRenderer node={content} />
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/camelcase
export async function unstable_getStaticProps() {
  const { packagePageData } = await import('../data');
  const data = await packagePageData('tumau');

  const props: Props = {
    packages: PACKAGES,
    ...data,
  };

  return {
    props,
  };
}

export default Home;
