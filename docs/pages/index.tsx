import React from 'react';
import { NextPage } from 'next';
import { MarkdownNodeRenderer } from '../src/components/MarkdownNodeRenderer';
import { PageContent } from '../src/data';
import { BasePageProps } from './_app';
import Head from 'next/head';

type Props = BasePageProps & {
  content: PageContent;
};

const Home: NextPage<Props> = ({ content, page }) => {
  return (
    <React.Fragment>
      <Head>
        <title>{page.name}</title>
      </Head>
      <div>
        <MarkdownNodeRenderer node={content} />
      </div>
    </React.Fragment>
  );
};

// eslint-disable-next-line @typescript-eslint/camelcase
export async function unstable_getStaticProps() {
  const { packagePageData } = await import('../src/data');
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
