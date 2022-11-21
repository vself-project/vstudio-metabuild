/* eslint-disable react/display-name */
// eslint-disable-next-line react/display-name
import { type NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { memo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import userImg from "../images/user.svg";
import thumbupImg from "../images/thumbup.svg";
import dollImg from "../images/doll.svg";
import star1Img from "../images/star1.svg";
import star2Img from "../images/star2.svg";
import star3Img from "../images/star3.svg";

import homeStyles from "./index.module.scss";

const Home: NextPage = memo(() => {
  const router = useRouter();

  const handleNaviagte = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | undefined,
    path: string
  ) => {
    router.push(path);
  };

  return (
    <div className={homeStyles.home}>
      <div className={homeStyles.description_container}>
        <div className={homeStyles.doll_container}>
          <div className={homeStyles.doll_img_container}>
            <Image layout="responsive" src={dollImg} alt="doll" />
          </div>
          <div className={homeStyles.try_now_badge_container}>
            <span className={homeStyles.try_now_badge}>Try now</span>
          </div>
        </div>
        <h1 className="text-[80px] font-extrabold text-white">vStudio</h1>
        <div className="text-[20px] font-extrabold text-[#B1B1B1]">
          When privacy comes first
        </div>
        <div className="text-[20px] font-normal font-inter text-[#B1B1B1]">
          Revolutionize the way web3 onboarding create private
          <br />
          communities where the governance method is a choice
        </div>
      </div>

      <Container>
        <Row>
          <Col sm={12} md={6} lg={6}>
            <div
              className={`${homeStyles.community_description} ${homeStyles.join_community}`}
              onClick={(e) => handleNaviagte(e, "/communities")}
            >
              <div className={homeStyles.star1_container}>
                <Image layout="responsive" src={star1Img} alt="star1" />
              </div>

              <div className={homeStyles.img_container}>
                <Image layout="responsive" src={userImg} alt="user" />
              </div>
              <div className={homeStyles.content}>
                <h1 className="text-[20px] font-extrabold font-grotesk leading-[22px] uppercase">
                  Join
                  <br />
                  community
                </h1>
                <div className="text-[16px] font-normal font-inter leading-[22px] mt-2">
                  Become a part of the DAO’s on your terms
                </div>
              </div>
            </div>
          </Col>

          <Col sm={12} md={6} lg={6}>
            <div
              className={`${homeStyles.community_description} ${homeStyles.create_community}`}
              onClick={(e) => handleNaviagte(e, "/create")}
            >
              <div className={homeStyles.star2_container}>
                <Image layout="responsive" src={star2Img} alt="star2" />
              </div>
              <div className={homeStyles.star3_container}>
                <Image layout="responsive" src={star3Img} alt="star3" />
              </div>

              <div className={homeStyles.img_container}>
                <Image layout="responsive" src={thumbupImg} alt="thumbup" />
              </div>
              <div className={homeStyles.content}>
                <h1 className="text-[20px] text-[#3D3D3D] font-extrabold font-grotesk leading-[22px] uppercase">
                  Create
                  <br />
                  community
                </h1>
                <div className="text-[16px] text-[#3D3D3D] font-normal font-inter leading-[22px] mt-2">
                  Start writing your Web3 story
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
});

export default Home;
