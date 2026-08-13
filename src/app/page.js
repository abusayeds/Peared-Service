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
import AllProviders from "../components/Home/AllProviders/AllProviders";
import HomeProjects from "../components/Home/HomeProjects/HomeProjects";

const MySwal = withReactContent(Swal);

const WorkflowModalContent = () => {
  const [lang, setLang] = useState("bn");

  const textBN = {
    title: "কীভাবে কাজ করবেন?",
    content: `
      <p><b>১. প্রোভাইডার খুঁজুন বা জব পোস্ট করুন:</b> ইউজার All Providers থেকে কাউকে মেসেজ করতে পারেন, অথবা পাবলিক প্রজেক্ট পোস্ট করতে পারেন।</p>
      <p><b>২. আগে কথা বলুন:</b> ইনবক্সে দাম ও কাজ নিয়ে আলোচনা করুন।</p>
      <p><b>৩. অফার পাঠান:</b> একমত হলে ইউজার অফার পাঠাবেন — সেটি ওই প্রোভাইডারের Pending Bids-এ যাবে।</p>
      <p><b>৪. একসেপ্ট:</b> প্রোভাইডার অফার একসেপ্ট করলে প্রজেক্ট শুরু হবে এবং একই চ্যাটে কাজ চলবে।</p>
      <p><b>৫. মার্কেটপ্লেস বিড:</b> পাবলিক জবে প্রোভাইডাররা বিড করতে পারে; ইউজার সেখান থেকেও একজনকে বেছে নিতে পারেন।</p>
      <p><b>৬. ডেলিভারি ও পেমেন্ট:</b> কাজ শেষে Done → Accept/Reject; পরে ওয়ালেট উইথড্র।</p>
    `,
  };

  const textEN = {
    title: "How it works?",
    content: `
      <p><b>1. Find a provider or post a job:</b> Message someone from All Providers, or post a public project.</p>
      <p><b>2. Chat first:</b> Agree on price and scope in Inbox.</p>
      <p><b>3. Send an offer:</b> The user sends a formal offer — it appears in that provider’s Pending Bids.</p>
      <p><b>4. Accept:</b> When the provider accepts, the project starts and chat continues in the same thread.</p>
      <p><b>5. Marketplace bids:</b> Providers can still bid on public jobs; users can accept a bid as before.</p>
      <p><b>6. Delivery & payment:</b> Done → Accept/Reject, then wallet withdraw.</p>
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
  const isProvider = user?.role === "provider";
  const isUser = user?.role === "user";
  const isGuest = !user;

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
      {/* Users + guests: providers list */}
      {(isUser || isGuest) && (
        <AllProviders
          title="All Providers"
          limit={4}
          showFilters={false}
          showPagination={false}
          compact
        />
      )}
      {/* Providers + guests: projects list */}
      {(isProvider || isGuest) && (
        <HomeProjects title="All Projects" limit={4} />
      )}
      <WhatPeared />
      <WhyPeared />
      <Feedback />
      <WantContractor />
      <Footer />
      {user && <BottomBar />}
    </>
  );
}
