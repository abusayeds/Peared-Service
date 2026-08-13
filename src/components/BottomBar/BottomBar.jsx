"use client";

import {
  FaBell,
  FaCheckCircle,
  FaComments,
  FaProjectDiagram,
  FaUser,
  FaWallet,
} from "react-icons/fa";
import { IoHome } from "react-icons/io5";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

export default function BottomBar() {
  const { user } = useSelector((state) => state.auth);
  const pathname = usePathname();

  const isActive = (href) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const providerItems = [
    { name: "Home", icon: <IoHome size={22} />, path: "/" },
    {
      name: "Projects",
      icon: <FaProjectDiagram size={22} />,
      path: "/profile/current-projects",
    },
    {
      name: "Bids",
      icon: <FaCheckCircle size={22} />,
      path: "/profile/my-bids",
    },
    { name: "Inbox", icon: <FaComments size={22} />, path: "/profile/inbox" },
    {
      name: "Alerts",
      icon: <FaBell size={22} />,
      path: "/profile/notifications",
    },
  ];

  const userItems = [
    { name: "Home", icon: <IoHome size={22} />, path: "/" },
    {
      name: "Projects",
      icon: <FaProjectDiagram size={22} />,
      path: "/profile/my-projects",
    },
    { name: "Inbox", icon: <FaComments size={22} />, path: "/profile/inbox" },
    { name: "Wallet", icon: <FaWallet size={22} />, path: "/profile/wallet" },
    { name: "Profile", icon: <FaUser size={22} />, path: "/profile/user" },
  ];

  const items = user?.role === "provider" ? providerItems : userItems;

  if (!user) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-secondary border-t border-hash/30 flex justify-around items-center px-1 py-2 safe-pb">
      {items.map((item) => (
        <Link
          href={item.path}
          key={item.name}
          className={`flex flex-col items-center min-w-0 px-1 py-1 rounded-md ${
            isActive(item.path) ? "text-primary" : "text-gray-600"
          }`}
        >
          {item.icon}
          <span className="text-[10px] mt-0.5 truncate max-w-[4.5rem]">
            {item.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
