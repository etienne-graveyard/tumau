import React from 'react';
import { NextPage } from 'next';
import { MarkdownNodeRenderer } from '../components/MarkdownNodeRenderer';
import { PageContent } from '../data';
import { BasePageProps } from './_app';

type Props = BasePageProps & {
  content: PageContent;
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
  const { content, page } = await packagePageData('/');

  const props: Props = {
    page,
    content,
  };

  return {
    props,
  };
}

export default Home;
