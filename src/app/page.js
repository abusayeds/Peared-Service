"use client";

import { useSelector } from "react-redux";
import BottomBar from "../components/BottomBar/BottomBar";
import Footer from "../components/Footer/Footer";
import Banner from "../components/Home/Banner/Banner";
import Feedback from "../components/Home/Feedback/Feedback";
import PopularServices from "../components/Home/PopularServices/PopularServices";
import WantContractor from "../components/Home/WantContractor/WantContractor";
import WhatPeared from "../components/Home/WhatPeared/WhatPeared";
import WhyPeared from "../components/Home/WhyPeared/WhyPeared";

export default function Home() {
  const { user } = useSelector((state) => state.auth);
  return (
    <>
      <Banner />
      <PopularServices />
      <WhatPeared />
      <WhyPeared />
      <Feedback />
      <WantContractor />
      <Footer />
      {user && <BottomBar />}
    </>
  );
}
