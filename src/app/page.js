"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import BottomBar from "../components/BottomBar/BottomBar";
import Footer from "../components/Footer/Footer";
import Banner from "../components/Home/Banner/Banner";
import Feedback from "../components/Home/Feedback/Feedback";
import PopularServices from "../components/Home/PopularServices/PopularServices";
import WantContractor from "../components/Home/WantContractor/WantContractor";
import WhatPeared from "../components/Home/WhatPeared/WhatPeared";
import WhyPeared from "../components/Home/WhyPeared/WhyPeared";

const MySwal = withReactContent(Swal);

const WorkflowModalContent = () => {
  const [lang, setLang] = useState("bn");

  const textBN = {
    title: "কীভাবে কাজ করবেন?",
    content: `
      <p><b>১. পোস্ট করা:</b> ইউজার তার কাজের বিবরণ, বাজেট ইত্যাদি দিয়ে জব পোস্ট করবেন।</p>
      <p><b>২. বিডিং:</b> প্রোভাইডাররা সেই জব পোস্টগুলো দেখবেন এবং নিজেদের অফার বা বিড করবেন।</p>
      <p><b>৩. নির্বাচন:</b> ইউজার তার জব পোস্টে আসা বিডগুলো থেকে পছন্দমতো একজনকে কাজের জন্য নির্বাচন (Accept) করবেন।</p>
      <p><b>৪. মেসেজিং:</b> কাজ শুরু হওয়ার পর ইউজার এবং প্রোভাইডার ওয়েবসাইটের ভেতরেই মেসেজের মাধ্যমে কথা বলতে পারবেন।</p>
      <p><b>৫. ডেলিভারি:</b> প্রোভাইডার কাজ শেষে তা ডেলিভারি দেবেন। ইউজার চাইলে তা গ্রহণ (Accept) অথবা বাতিল (Reject) করতে পারবেন।</p>
      <p><b>৬. পেমেন্ট:</b> ইউজার কাজ বুঝে নিলে প্রোভাইডার টাকা উইথড্র (Withdraw) করার রিকোয়েস্ট দিতে পারবেন। অ্যাডমিন সেটি অ্যাকসেপ্ট করলে টাকা প্রোভাইডারের ওয়ালেটে চলে যাবে।</p>
    `,
  };

  const textEN = {
    title: "How it works?",
    content: `
      <p><b>1. Post a Job:</b> Users can post a job with details, budget, etc.</p>
      <p><b>2. Bidding:</b> Providers can see the job posts and place their bids/offers.</p>
      <p><b>3. Selection:</b> Users will select (Accept) one of the providers from the submitted bids.</p>
      <p><b>4. Messaging:</b> After the job starts, the user and provider can communicate via in-app messaging.</p>
      <p><b>5. Delivery:</b> The provider will deliver the work upon completion. The user can either Accept or Reject it.</p>
      <p><b>6. Payment:</b> Once the user accepts the delivery, the provider can request a withdrawal. After admin approval, the funds will be added to the provider's wallet.</p>
    `,
  };

  const currentText = lang === "bn" ? textBN : textEN;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800 m-0">{currentText.title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${lang === "en" ? "bg-primary text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("bn")}
            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${lang === "bn" ? "bg-primary text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            BN
          </button>
        </div>
      </div>
      <div
        style={{ textAlign: "left", fontSize: "15px", lineHeight: "1.8", color: "#333" }}
        dangerouslySetInnerHTML={{ __html: currentText.content }}
      />
    </div>
  );
};

export default function Home() {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem("hasSeenWorkflowModal");
    if (!hasSeenModal) {
      MySwal.fire({
        html: <WorkflowModalContent />,
        confirmButtonColor: "#DEAD35",
        confirmButtonText: "Close / বন্ধ করুন",
        width: "600px",
      }).then(() => {
        sessionStorage.setItem("hasSeenWorkflowModal", "true");
      });
    }
  }, []);

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
