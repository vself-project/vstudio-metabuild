import * as React from "react";
import { Spin, Modal } from "antd";
import Image from "next/image";
import closeIco from "../../images/close_ico.svg";

interface IProps {
    showModal: boolean;
    messageType: string;
    message: string;
    handleShowModal(showModal: boolean): void;
}

const NotificationModal = (props: IProps) => {
    const { showModal, messageType, message, handleShowModal } = props
    return (
        <Modal
            centered
            maskClosable={false}
            open={showModal}
            footer={
                <div className="w-full text-center mb-[20px]">
                    <button
                        className="main-green-bg rounded-[20px] text-[16px] text-[#3D3D3D] font-medium font-inter leading-[32px] px-[50px]"
                        onClick={() => handleShowModal(false)}
                    >
                        Confirm
                    </button>
                </div>
            }
            style={{ borderRadius: '20px' }}
            bodyStyle={{ padding: '20px 20px', minHeight: '180px' }}
            width={472}
            closeIcon={<Image src={closeIco} alt="close" />}
            onCancel={() => handleShowModal(false)}
        >
            <h1 className="text-[20px] text-[#3D3D3D] font-extrabold font-grotesk leading-[40px] tracking-[0.04em] mb-[12px]">{messageType}</h1>
            <h2 className="text-[16px] text-[#000000] font-normal font-inter leading-[20px]">{message}</h2>
        </Modal>
    );
}

export default NotificationModal;