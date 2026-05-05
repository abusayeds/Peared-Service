"use client";

import { useSelector } from "react-redux";
import ProviderProfile from "../../../components/profile/my-profile/ProviderProfile";
import UserProfile from "../../../components/profile/my-profile/UserProfile";

export default function ProfileHomePage() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="px-4">
      <h3 className="text-2xl font-semibold text-center text-primary mb-6 pt-2">
        My Profile
      </h3>
      {user?.role === "provider" ? (
        <>
          <ProviderProfile />
        </>
      ) : (
        <>
          <UserProfile />
        </>
      )}
    </div>
  );
}
