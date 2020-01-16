import React from 'react';
import { NextPage } from 'next';
import { PageData } from '../../data';
import { MarkdownNodeRenderer } from '../../components/MarkdownNodeRenderer';
import PACKAGES from '../../data/packages.json';

type Props = PageData & {};

const Post: NextPage<Props> = ({ content }) => {
  return <MarkdownNodeRenderer node={content} />;
};

// eslint-disable-next-line @typescript-eslint/camelcase
export async function unstable_getStaticPaths() {
  return PACKAGES.map((pkg): { params: { slug: string } } => {
    return { params: { slug: pkg.slug } };
  });
}

// eslint-disable-next-line @typescript-eslint/camelcase
export async function unstable_getStaticProps({ params }: { params: { slug: string } }) {
  const { packagePageData } = await import('../../data');
  const pageData = await packagePageData(params.slug);
  return {
    props: {
      ...pageData,
    },
  };
}

export default Post;
