import React from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from '../components/Layout';
import { Page } from '../data/pages';

import 'normalize.css';
import '../style/index.css';
import 'highlight.js/styles/night-owl.css';
import { Head } from 'next/document';

type Props = Omit<AppProps, 'pageProps'> & { pageProps: BasePageProps };

export interface BasePageProps {
  page: Page;
}

const MyApp: NextPage<Props> = ({ Component, pageProps }) => {
  const page = pageProps.page;

  let slug: string | null = page ? page.slug : null;
  if (slug === null && 'statusCode' in pageProps) {
    slug = 'not-found';
  }

  return (
    <Layout currentPage={slug}>
      {page && (
        <Head>
          <title>{page.name}</title>
        </Head>
      )}
      <AnimatePresence exitBeforeEnter>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100, transition: { ease: 'easeOut', duration: 0.3 } }}
          transition={{ ease: 'easeOut', duration: 0.5 }}
          key={slug || ''}
        >
          <Component {...(pageProps as any)} />
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default MyApp;
