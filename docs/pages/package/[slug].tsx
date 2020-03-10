import React from 'react';
import { NextPage, GetStaticPaths, GetStaticProps } from 'next';
import { PageContent } from '../../src/data';
import { MarkdownNodeRenderer } from '../../src/components/MarkdownNodeRenderer';
import { PAGES } from '../../src/data/pages';
import { BasePageProps } from '../_app';
import Head from 'next/head';

type Props = BasePageProps & {
  content: PageContent;
};

const Post: NextPage<Props> = ({ content, page }) => {
  return (
    <React.Fragment>
      <Head>
        <title>{page.name}</title>
      </Head>
      <MarkdownNodeRenderer node={content} />
    </React.Fragment>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = PAGES.filter(pkg => pkg.page === '/package/[slug]').map((pkg): string => {
    return pkg.slug;
  });

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params) {
    throw new Error('Oops');
  }
  const { packagePageData } = await import('../../src/data');
  const { content, page } = await packagePageData(`/package/${params.slug}` as any);
  const props: Props = {
    content: JSON.parse(JSON.stringify(content)),
    page,
  };
  return {
    props,
  };
};

export default Post;
