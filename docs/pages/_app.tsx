import React from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from '../src/components/Layout';
import { Page } from '../src/data/pages';
import { MenuToggleProvider, useMenuToggleState } from '../src/components/MenuToggleProvider';

import 'normalize.css';
import '../src/style/index.css';
import 'highlight.js/styles/night-owl.css';

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

  const menu = useMenuToggleState();

  const hideMenuRef = React.useRef(menu.hide);
  hideMenuRef.current = menu.hide;

  React.useEffect(() => {
    hideMenuRef.current();
    // console.log(slug);
  }, [slug]);

  return (
    <MenuToggleProvider ctx={menu}>
      <Layout currentPage={slug}>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ ease: 'easeOut', duration: 0.5 }}
            key={slug || ''}
          >
            <Component {...(pageProps as any)} />
          </motion.div>
        </AnimatePresence>
      </Layout>
    </MenuToggleProvider>
  );
};

export default MyApp;
