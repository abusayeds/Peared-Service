"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import AllProviders from "../../components/Home/AllProviders/AllProviders";
import BottomBar from "../../components/BottomBar/BottomBar";
import Footer from "../../components/Footer/Footer";

export default function ProvidersPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === "provider") {
      router.replace("/projects");
    }
  }, [user, router]);

  if (user?.role === "provider") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-white">
      <AllProviders title="All Providers" limit={12} showFilters showPagination />
      <Footer />
      <BottomBar />
    </div>
  );
}
