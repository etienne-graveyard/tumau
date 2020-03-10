import React from 'react';
import { NextPage, GetStaticProps } from 'next';
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

export const getStaticProps: GetStaticProps = async () => {
  const { packagePageData } = await import('../src/data');
  const { content, page } = await packagePageData('/');

  const props: Props = {
    page,
    content: JSON.parse(JSON.stringify(content)),
  };

  return {
    props,
  };
};

export default Home;
