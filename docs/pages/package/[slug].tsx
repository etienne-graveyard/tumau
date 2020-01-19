import React from 'react';
import { NextPage } from 'next';
import { PageContent } from '../../data';
import { MarkdownNodeRenderer } from '../../components/MarkdownNodeRenderer';
import { PAGES } from '../../data/pages';
import { BasePageProps } from '../_app';
import Head from 'next/head';

type Props = BasePageProps & {
  content: PageContent;
};

const Post: NextPage<Props> = ({ content }) => {
  return (
    <React.Fragment>
      <Head>
        <title>Tumau</title>
      </Head>
      <MarkdownNodeRenderer node={content} />
    </React.Fragment>
  );
};

// eslint-disable-next-line @typescript-eslint/camelcase
export async function unstable_getStaticPaths() {
  return PAGES.filter(pkg => pkg.page === '/package/[slug]').map((pkg): { params: { slug: string } } => {
    const slug = pkg.slug.substring('/package/'.length);
    return { params: { slug } };
  });
}

// eslint-disable-next-line @typescript-eslint/camelcase
export async function unstable_getStaticProps({ params }: { params: { slug: string } }) {
  const { packagePageData } = await import('../../data');
  const { content, page } = await packagePageData(`/package/${params.slug}` as any);
  const props: Props = {
    content,
    page,
  };

  return {
    props,
  };
}

export default Post;
