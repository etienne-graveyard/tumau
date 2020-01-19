import React from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from '../components/Layout';
import { Page } from '../data/pages';

import 'normalize.css';
import '../style/index.css';
import 'highlight.js/styles/night-owl.css';

type Props = Omit<AppProps, 'pageProps'> & { pageProps: BasePageProps };

export interface BasePageProps {
  page: Page;
}

const MyApp: NextPage<Props> = ({ Component, pageProps }) => {
  const page = pageProps.page;

  return (
    <Layout currentPage={page.slug}>
      <AnimatePresence exitBeforeEnter>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100, transition: { ease: 'easeOut', duration: 0.3 } }}
          transition={{ ease: 'easeOut', duration: 0.5 }}
          key={page.slug}
        >
          <Component {...(pageProps as any)} />
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default MyApp;
