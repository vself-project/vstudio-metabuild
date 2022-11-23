import { type NextPage } from "next";
import Image from 'next/image';
import { useRouter } from "next/router";
import { memo, useEffect, useState } from 'react';
import { Spin, Tooltip } from "antd";
import axios from "axios";
import NotificationModal from "../../../../components/Modal";
import { ICommunityInfo } from "../../../../data/interfaces";
import badgeStar1 from "../../../../images/badge_star1.svg";
import badgeStar2 from "../../../../images/badge_star2.svg";
import { useContractInteractor } from "../../../../utils";
import { useWalletSelector } from "../../../../contexts/WalletSelectorContext";
import { CHECK_URL } from "../../../../constants";


const ClaimBadge: NextPage = memo(() => {
    const router = useRouter();
    const { selector, modal, accounts, accountId } = useWalletSelector();
    const { handleSignIn, viewMethod, callMethod } = useContractInteractor();
    const [communityInfo, setCommunityInfo] = useState<ICommunityInfo | null>();
    const [messageType, setMessageType] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const initialize = async () => {
        try {
            const communityId = router.query.communityId;
            const result: any[] = await viewMethod({
                method: "get_community",
                args: {
                    community_id: communityId
                }
            });

            const communityInfo: ICommunityInfo = {
                ...result[0],
                community_id: communityId,
                members: result[1],
                public_members: result[2]
            };

            setCommunityInfo(communityInfo);
        } catch (e) {
            console.log("error: ", e);
        }
    }

    const handleShowModal = (showModal: boolean) => {
        setShowModal(showModal);
    }

    const handleClaimBadge = async () => {
        try {
            setIsProcessing(true);
            const args = {
                community_id: communityInfo?.community_id,
                commitment: router.query.commitment,
                near_id: accountId
            };

            const operationStatus = await callMethod({ method: "add_public_member", args });
            if (operationStatus) {
                setIsProcessing(false);
                const url = `/api/checkin?eventid=${communityInfo?.badge_event_id}&nearid=${accountId}&qr=${communityInfo?.community_name}`;
                const rsp = await fetch(url);
                const res = await rsp.json();
                setIsProcessing(false);
                if (res?.errorMessage == null && res?.index != -1) {
                    router.push(`/communities/${router.query.communityId}/claimbadge/success`);
                } else {
                    router.push(`/communities/${router.query.communityId}/claimbadge/error`);
                }
            } else {
                setIsProcessing(false);
                setMessageType("Error");
                setMessage("Failed to add public member");
                setShowModal(true);
            }

        } catch (e) {
            console.log("claim badge error: ", e);
            setIsProcessing(false);
            setMessageType("Error");
            setMessage("Failed to claim badge");
            setShowModal(true);
        }
    }

    useEffect(() => {
        (async () => {
            await initialize();
        })()
    }, []);

    return (
        <Spin spinning={isProcessing}>
            <div className="bg-white rounded-[20px] text-[#3D3D3D] font-inter relative">
                <div className="absolute w-[150px] left-[-75px] top-[calc(50%-75px)]">
                    <Image
                        layout="responsive"
                        src={badgeStar1}
                        alt="star2"
                    />
                </div>

                <div className="px-[80px] py-[40px]">
                    <div className="flex items-center space-x-[50px]">
                        <div className="flex-none w-[125px] rounded-full">
                            {
                                communityInfo && communityInfo?.community_source_image && (
                                    <img
                                        src={communityInfo.community_source_image}
                                        alt="community_source_image"
                                        width={125}
                                        height={125}
                                    />
                                )
                            }
                        </div>
                        <div className="flex-initial w-[400px] text-left">
                            <h1 className="text-[20px] leading-10 font-extrabold font-grotesk tracking-[0.04em] mb-[15px]">{communityInfo?.community_name}</h1>
                            <h3 className="text-[16px] leading-5 font-normal">{communityInfo?.community_description}</h3>
                        </div>
                    </div>

                    <div className="main-blue-bg rounded-[20px] text-[20px] leading-[30px] tracking-[0.04em] px-[60px] py-[25px] text-left my-[30px] text-white font-extrabold font-grotesk relative">
                        <div className="absolute w-[150px] top-[-75px] right-[50px]">
                            <Image
                                layout="responsive"
                                src={badgeStar2}
                                alt="star2"
                            />
                        </div>
                        <div>Attention!</div>
                        <div>The membership badge is a non-transferable<br />NFT and will be seen on NEAR blockchain</div>
                    </div>

                    <div className="flex items-center space-x-[50px]">
                        <div className="flex-none w-[125px] rounded-full">
                            {
                                communityInfo && communityInfo?.badge_source_image && (
                                    <img
                                        src={communityInfo.badge_source_image}
                                        alt="badge_source_image"
                                        width={125}
                                        height={125}
                                    />
                                )
                            }
                        </div>
                        <div className="flex-initial w-[400px] text-left">
                            <h1 className="text-[20px] leading-10 font-extrabold font-grotesk tracking-[0.04em] mb-[15px]">{communityInfo?.badge_name}</h1>
                            <h3 className="text-[16px] leading-5 font-normal">{communityInfo?.badge_description}</h3>
                        </div>
                        <div className="flex-initial w-48">
                            <button
                                className="w-full main-green-bg py-[5px] rounded-full font-medium"
                                onClick={() => accountId ? handleClaimBadge() : handleSignIn()}
                            >
                                {accountId ? "Confirm" : "Sign in"}
                            </button>
                        </div>
                    </div>
                </div>
                <NotificationModal
                    messageType={messageType}
                    message={message}
                    showModal={showModal}
                    handleShowModal={handleShowModal}
                />
            </div>
        </Spin>
    );
});

ClaimBadge.displayName = "ClaimBadge";
export default ClaimBadge;