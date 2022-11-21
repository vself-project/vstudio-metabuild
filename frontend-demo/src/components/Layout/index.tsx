import { memo } from "react";
import { ToastContainer } from "react-toastify";
import { NextPage } from "next";
import Head from "next/head";
import Header from "../Header";
import Footer from "../Footer";
import { HomepageMeta } from "../../data/interfaces";
import layoutStyles from "./index.module.scss";
import { WalletSelectorContextProvider } from "../../contexts/WalletSelectorContext";

const Layout: NextPage<HomepageMeta | any> = memo(
  ({ children, title, description }) => {
    return (
      <WalletSelectorContextProvider>
        <div className={layoutStyles.layout + " font-druk"}>
          <div className={layoutStyles.warp_container}>
            <Head>
              <title>{title}</title>
              <meta content={description} name="description" />
            </Head>
            <Header />
            <main className={layoutStyles.main_container}>{children}</main>
            <Footer />
          </div>
        </div>
        <ToastContainer autoClose={1500} />
      </WalletSelectorContextProvider>
    );
  }
);

Layout.displayName = "Layout";
export default Layout;
