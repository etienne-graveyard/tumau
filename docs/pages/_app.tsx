import React from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';

import 'normalize.css';
import '../style/index.css';
import 'highlight.js/styles/night-owl.css';
import { Layout } from '../components/Layout';

type Props = AppProps;

const MyApp: NextPage<Props> = ({ Component, pageProps }) => {
  return (
    <Layout currentPackage={pageProps.packageSlug}>
      <Component {...pageProps} />;
    </Layout>
  );
};

export default MyApp;
