/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { memo, useEffect, useState } from "react";
import { useWalletSelector } from "../../../contexts/WalletSelectorContext";
import { useContractInteractor } from "../../../utils";
import type { ICommunityInfo } from "../../../data/interfaces";

const CommunityJoin: NextPage = memo(() => {
  const router = useRouter();
  const { viewMethod } = useContractInteractor();
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [communityInfo, setCommunityInfo] = useState<ICommunityInfo | null>();

  const { key, commitment } = router.query;

  const initialize = async () => {
    try {
      const communityId = router.query.communityId;
      const result: any[] = await viewMethod({
        method: "get_community",
        args: {
          community_id: communityId,
        },
      });

      const communityInfo: ICommunityInfo = {
        ...result[0],
        community_id: communityId,
        members: result[1],
        public_members: result[2],
      };

      setCommunityInfo(communityInfo);
      console.log(communityInfo);
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const handleNaviagte = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | undefined,
    path: string
  ) => {
    e?.preventDefault();
    router.push(path);
  };

  useEffect(() => {
    (async () => {
      await initialize();
    })();
  }, []);

  return (
    <div className="bg-white rounded-[20px] text-[#3D3D3D] font-inter">
      <div className="px-[80px] py-[40px]">
        <div className="flex items-center gap-[50px]">
          <div className="w-[125px] rounded-full">
            {communityInfo && communityInfo?.community_source_image && (
              <img
                src={communityInfo?.community_source_image}
                alt="community_source_image"
                width={125}
                height={125}
              />
            )}
          </div>
          <div className="text-left">
            <h1 className="text-[20px] leading-10 font-extrabold font-grotesk tracking-[0.04em] mb-[15px]">
              {communityInfo?.community_name}
            </h1>
            <h3 className="text-[16px] leading-5 font-bold">
              {communityInfo?.community_description}
            </h3>
          </div>
        </div>

        <div className="text-left mt-[25px]">
          <div className="flex space-x-[20px] my-[15px] items-center">
            <div className="flex-none w-[110px] text-[16px] font-bold">
              commited:
            </div>
            <div className="flex-initial w-80">
              <input
                value={commitment}
                className="bg-[#F5F5F5] rounded-full w-full py-[5px] px-[15px]"
                placeholder=""
                disabled
              />
            </div>
            <div className="flex-initial w-48">
              <button
                className="w-full main-green-bg py-[5px] rounded-full font-medium"
                onClick={(e) =>
                  handleNaviagte(
                    e as any,
                    `/communities/${router.query.communityId}/join`
                  )
                }
              >
                Copy
              </button>
            </div>
          </div>
          <div className="flex space-x-[20px] my-[10px] items-center">
            <div className="flex-none w-[110px] text-[16px] font-bold">
              membership key:
            </div>
            <div className="flex-initial w-80">
              <input
                value={key}
                className="bg-[#F5F5F5] rounded-full w-full py-[5px] px-[15px]"
                placeholder=""
                disabled
              />
            </div>
            <div className="flex-initial w-48">
              <button className="w-full main-green-bg py-[5px] rounded-full font-medium">
                Copy
              </button>
            </div>
            <div className="flex-initial text-[14px] w-[125px]"></div>
          </div>
        </div>

        <div className="w-full">
          <p className="text-left">
            Important: Save your membership key. It is needed to generate a
            proof of membership
          </p>
        </div>

        <hr className="my-[30px]" />

        <div className="text-left mt-[25px]">
          <div className="flex space-x-[20px] my-[15px] items-center">
            <div className="flex-none w-[450px] text-[16px] font-bold">
              Public membership badge or stay private?:
            </div>
            <div className="flex-initial w-48">
              <button
                className="w-full bg-[#3D3D3D] py-[5px] rounded-full font-medium text-white"
                onClick={(e) => handleNaviagte(e as any, `/`)}
              >
                Stay private
              </button>
            </div>
            <div className="flex-initial w-48">
              <button
                className="w-full main-green-bg py-[5px] rounded-full font-medium"
                onClick={(e) =>
                  handleNaviagte(
                    e as any,
                    `/communities/${router.query.communityId}/claimbadge?commitment=${commitment}`
                  )
                }
              >
                Claim badge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CommunityJoin;
