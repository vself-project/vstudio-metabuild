import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { memo } from "react";
import Footer from "../../../../components/Footer";
import Header from "../../../../components/Header";
import { WalletSelectorContextProvider } from "../../../../contexts/WalletSelectorContext";
import { homePageMeta } from "../../../../data";
import errorDollImg from "../../../../images/error_doll.svg";

export default function BadgeClaimError() {
  const router = useRouter();
  console.log("wtf");
  const handleNaviagte = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | undefined,
    path: string
  ) => {
    e?.preventDefault();
    router.push(path);
  };

  return (
    <div className="text-[#3D3D3D] font-inter w-full flex justify-center pt-[200px]">
      <div className="relative">
        <div className="absolute top-[-120px] right-[calc(50%-300px)] w-[420px]">
          <Image layout="responsive" src={errorDollImg} alt="error_doll" />
        </div>
        <span className="text-white text-[80px] font-extrabold leading-[80px] tracking-[0.04em] font-grotesk">
          Error
          <br />
          message
        </span>
      </div>
    </div>
  );
}

BadgeClaimError.getLayout = function getLayout(page: any) {
  const { title, description } = homePageMeta;

  return (
    <WalletSelectorContextProvider>
      <div
        className="bg-[#262626] h-screen bg-cover"
        style={{ backgroundImage: "url('/bg2.svg')" }}
      >
        <div className="min-h-[100vh] pt-[70px]">
          <Head>
            <title>{title}</title>
            <meta content={description} name="description" />
          </Head>
          <Header />
          <main className="h-[calc(100vh-142px)]">{page}</main>
          <Footer />
        </div>
      </div>
    </WalletSelectorContextProvider>
  );
};
