/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { memo, useEffect, useState } from "react";
import { Tooltip } from "antd";
import copy from "copy-to-clipboard";
import { useWalletSelector } from "../../contexts/WalletSelectorContext";
import type { ICommunityInfo } from "../../data/interfaces";
import {
  useContractInteractor,
  getRandomInt,
  toHexString,
  downloadObjectAsJson,
} from "../../utils";

import * as wasm from "../../../../shared-utils/pkg";

const DEFAULT_TEXT = "Copy to clipboard";
const COPIED_TEXT = "Copied";

const Communities: NextPage = memo(() => {
  const router = useRouter();
  const { viewMethod, callMethod } = useContractInteractor();
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const { handleSignIn } = useContractInteractor();
  const [communityInfo, setCommunityInfo] = useState<ICommunityInfo | null>();
  const [membershipKey, setMembershipKey] = useState<string>("");
  const [proofKey, setProofKey] = useState<string>("");
  const [clipboardText, setClipboardText] = useState<string>(DEFAULT_TEXT);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null
  );

  const handleNavigate = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | undefined,
    path: string
  ) => {
    e?.preventDefault();
    router.push(path);
  };

  const initialize = async () => {
    try {
      const randomInt = await getRandomInt(1000000);
      const communityId = router.query.communityId;
      const result: any[] = await viewMethod({
        method: "get_community",
        args: {
          community_id: communityId,
        },
      });

      console.log("Result: ", result);

      const communityInfo: ICommunityInfo = {
        ...result[0],
        community_id: communityId,
        members: result[1],
        public_members: result[2],
      };

      setCommunityInfo(communityInfo);
      setMembershipKey(randomInt.toString());
    } catch (e) {
      console.log("error: ", e);
    }
  };

  useEffect(() => {
    (async () => {
      await initialize();
    })();
  }, []);

  // Create commitment ans save it in the contract
  const joinCommunity = async (e: any) => {
    try {
      // Create commitment from membershipKey
      const image = wasm.mimc_hash(
        BigInt(membershipKey),
        BigInt(membershipKey)
      );
      const commitment = toHexString(image.image_bytes);
      console.log({ commitment });

      // Save commitment in the contract
      const community_id = router.query.communityId;
      const result = await callMethod({
        method: "add_member",
        args: { community_id, commitment },
      });
      if (result) {
        handleNavigate(
          e as any,
          `/communities/${communityInfo?.community_id}/join?key=${membershipKey}&commitment=${commitment}`
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Generate proof using proofKey and make membership verification
  const verifyMembership = async () => {
    try {
      // Get list of commitments and convert it to bytes
      const community_id = router.query.communityId;
      const members = await viewMethod({
        method: "get_community_members",
        args: { community_id },
      });
      const set = members.map((value: any) => {
        return { image_bytes: Buffer.from(value, "hex") };
      });
      console.log(set);

      // Create proof from proofKey and download it
      const proof = wasm.prove_set_membership(
        set,
        BigInt(proofKey),
        BigInt(proofKey)
      );
      downloadObjectAsJson(proof, "proof_" + accountId);
      console.log(proof);

      // Make verification and show the result
      const result = wasm.verify_set_membership(set, proof);
      console.log(result);
      setVerificationResult(result);
      const delay = result ? 25000 : 5000;
      setTimeout(() => {
        setVerificationResult(null);
      }, delay);
    } catch (err) {
      console.log(err);
    }
  };

  // Navigate to `claimbadge` page
  const goToClaimBagePage = async (e: any) => {
    // Create commitment from membershipKey
    const image = wasm.mimc_hash(
      BigInt(membershipKey),
      BigInt(membershipKey)
    );
    const commitment = toHexString(image.image_bytes);

    // Navigate to claimbadge page
    handleNavigate(
      e as any,
      `/communities/${router.query.communityId}/claimbadge?commitment=${commitment}`
    );
  };

  return (
    <div className="bg-white rounded-[20px] text-[#3D3D3D] font-inter w-full max-w-[1030px]">
      <div className="px-[80px] py-[40px]">
        <div className="flex items-center gap-[50px]">
          <div
            className={`w-[125px] rounded-full ${
              !accountId ? "grayscale" : ""
            }`}
          >
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
            <div className="mt-[15px]">
              <h5>
                <strong>administrator:</strong> {communityInfo?.community_owner}
              </h5>
              <h5>
                <strong>public members:</strong>{" "}
                {communityInfo?.public_members &&
                  Object.keys(communityInfo?.public_members).length}
              </h5>
              {accountId && (
                <h5>
                  <strong>private members:</strong>{" "}
                  {communityInfo && communityInfo?.members?.length}
                </h5>
              )}
            </div>
          </div>
          {accountId && (
            <button className="bg-[#FB40FF] text-white text-[12px] text-medium px-[50px] py-[3px] rounded-full">
              Share link
            </button>
          )}
        </div>

        {/* Display when current user is a community owner */}
        {accountId == communityInfo?.community_owner && (
          <>
            <hr className="mt-[30px] opacity-20" />
            <div className="flex items-center gap-[50px]">
              <div
                className={`w-[125px] rounded-full ${
                  !accountId ? "grayscale" : ""
                }`}
              >
                {communityInfo && communityInfo?.badge_source_image && (
                  <img
                    src={communityInfo?.badge_source_image}
                    alt="badge_source_image"
                    width={125}
                    height={125}
                  />
                )}
              </div>
              <div className="text-left">
                <h1 className="text-[20px] leading-10 font-extrabold font-grotesk tracking-[0.04em] mb-[15px]">
                  {communityInfo?.badge_name}
                </h1>
                <h3 className="text-[16px] leading-5 font-bold">
                  {communityInfo?.badge_description}
                </h3>
              </div>
            </div>
            <hr className="mt-[30px] opacity-20" />
            <div className="text-left">
              <h1 className="text-[20px] text-[#3D3D3D] font-grotesk font-extrabold leading-[40px] tracking-[0.04em] my-[20px]">
                Public Members
              </h1>
              <div className="flex flex-wrap gap-[10px]">
                {communityInfo &&
                  communityInfo?.public_members &&
                  Object.values(communityInfo?.public_members).map(
                    (item, index) => {
                      return (
                        <div
                          key={index}
                          className="bg-[#F5F5F5] rounded-full text-[16px] text-[#3D3D3D] font-inter px-[15px] py-[5px]"
                        >
                          {item}
                        </div>
                      );
                    }
                  )}
              </div>
            </div>
          </>
        )}

        {/* Account ID isn't defined */}
        {!accountId && (
          <div className="flex items-center gap-[50px] mt-[40px]">
            <div className={`w-[125px]`}></div>
            <div className="text-left">
              <h1 className="text-[30px] text-[#3D3D3D] font-extrabold font-grotesk leading-[40px] trancking-[0.04em]">
                You are not authorized.
                <br />
                Please{" "}
                <span
                  className="text-[#FB40FF] underline cursor-pointer"
                  onClick={handleSignIn}
                >
                  sign in
                </span>
              </h1>
            </div>
          </div>
        )}

        {/* General case */}
        {accountId &&
          communityInfo &&
          accountId != communityInfo?.community_owner && (
            <>
              <div className="text-left mt-[25px]">
                <h1 className="text-[20px] leading-10 font-extrabold font-grotesk">
                  Join community
                </h1>
                <div className="flex space-x-[20px] my-[5px] items-center">
                  <div className="flex-none w-[180px] text-[16px] font-bold">
                    signed as:
                  </div>
                  <div className="flex-initial w-80">
                    <input
                      className="bg-[#F5F5F5] rounded-full w-full py-[5px] px-[15px]"
                      defaultValue={accountId}
                      placeholder="near_account.testnet"
                    />
                  </div>
                  <div className="flex-initial w-48">
                    <button
                      className="w-full main-green-bg py-[5px] rounded-full font-medium text-[16px]"
                      onClick={joinCommunity}
                    >
                      Join
                    </button>
                  </div>
                  <div className="flex-initial text-[14px] w-[125px]"></div>
                </div>
                <div className="flex space-x-[20px] my-[5px] items-center">
                  <div className="flex-none w-[180px] text-[16px] font-bold">
                    your membership key:
                  </div>
                  <div className="flex-initial w-80">
                    <input
                      className="bg-[#F5F5F5] rounded-full w-full py-[5px] px-[15px]"
                      value={membershipKey}
                      placeholder="random number"
                      disabled
                    />
                  </div>
                  <div className="flex-initial w-48">
                    <Tooltip placement="right" title={clipboardText}>
                      <button
                        className="w-full main-green-bg py-[5px] rounded-full"
                        onClick={() => {
                          copy(membershipKey);
                          setClipboardText(COPIED_TEXT);
                        }}
                        onMouseOut={() => {
                          setTimeout(() => {
                            setClipboardText(DEFAULT_TEXT);
                          }, 300);
                        }}
                      >
                        Copy
                      </button>
                    </Tooltip>
                  </div>
                  <div className="flex-initial text-[14px] w-[125px]">
                    what&apos;s memership key?
                  </div>
                </div>
              </div>

              <div className="text-left mt-[25px]">
                <h1 className="text-[20px] leading-10 font-extrabold font-grotesk">
                  Get proof and verify it
                </h1>
                <div className="flex space-x-[20px] my-[5px] items-center">
                  <div className="flex-none w-[180px] text-[16px] font-bold">
                    signed as:
                  </div>
                  <div className="flex-initial w-80">
                    <input
                      className="bg-[#F5F5F5] rounded-full w-full py-[5px] px-[15px]"
                      defaultValue={accountId}
                      placeholder="near_account.testnet"
                    />
                  </div>
                  <div className="flex-initial w-48">
                    <button
                      className="w-full main-green-bg py-[5px] rounded-full"
                      onClick={verifyMembership}
                    >
                      Verify Proof
                    </button>
                  </div>
                </div>
                <div className="flex space-x-[20px] my-[5px] items-center">
                  <div className="flex-none w-[180px] text-[16px] font-bold">
                    membership key:
                  </div>
                  <div className="flex-initial w-80">
                    <input
                      className="bg-[#F5F5F5] rounded-full w-full py-[5px] px-[15px]"
                      placeholder="Put your membership key"
                      value={proofKey}
                      onChange={(e) => {
                        setProofKey(e.target.value);
                      }}
                    />
                  </div>
                  {verificationResult !== null && (
                    <div className="flex-initial w-48 text-center">
                      {verificationResult ? (
                        // (<p className="font-medium text-green-500">Successful Verification</p>)
                        <button
                          className="w-full main-green-bg py-[5px] rounded-full"
                          onClick={goToClaimBagePage}
                        >
                          Claim Badge
                        </button>
                      ) : (
                        <p className="font-medium text-red-800">
                          Verification failed
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* <div className="text-left mt-[25px]">
                                <h1 className="text-[20px] leading-10 font-extrabold font-grotesk">Verify proof</h1>
                                <div className="flex space-x-[20px] my-[5px] items-center">
                                    <div className="flex-none w-[180px] text-[16px] font-bold">
                                        proof:
                                    </div>
                                    <div className="flex-initial w-80">
                                        <input className="bg-[#F5F5F5] rounded-full w-full py-[5px] px-[15px]" placeholder="near_account.testnet" />
                                    </div>
                                    <div className="flex-initial w-48">
                                        <button className="w-full main-green-bg py-[5px] rounded-full">Verify</button>
                                    </div>
                                </div>
                            </div> */}
            </>
          )}
      </div>
    </div>
  );
});

export default Communities;
