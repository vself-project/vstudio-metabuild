/* eslint-disable @typescript-eslint/ban-types */
import { type AppType } from "next/dist/shared/lib/utils";
import App from "next/app";
import type { AppProps, AppContext } from "next/app";
import type { ReactNode } from "react";
import type { NextPage } from "next";
import Layout from "../components/Layout";
import { homePageMeta } from "../data";

import "../styles/globals.scss";

type Page<P = {}> = NextPage<P> & {
  getLayout?: (page: ReactNode) => ReactNode;
};

type Props = AppProps & {
  Component: Page;
};

const MyApp = ({ Component, pageProps }: Props) => {
  const { title, description } = homePageMeta;
  const renderWithLayout =
    Component.getLayout ||
    function (page) {
      return (
        <Layout description={description} title={title}>
          {page}
        </Layout>
      );
    };

  return renderWithLayout(<Component {...pageProps} />);
};

MyApp.getInitialProps = async (context: AppContext) => {
  const appProps = await App.getInitialProps(context);
  return { ...appProps };
};

export default MyApp;
