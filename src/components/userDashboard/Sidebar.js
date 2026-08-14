"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBell,
  FaCheckCircle,
  FaChevronDown,
  FaClipboardList,
  FaComments,
  FaCog,
  FaFileAlt,
  FaProjectDiagram,
  FaSignOutAlt,
  FaStar,
  FaUser,
  FaWallet,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useGetUnreadCountQuery } from "../../redux/features/chat/chatApi";
import { logout } from "../../redux/slices/authSlice";
import UnreadBadge from "../utils/UnreadBadge";

export default function Sidebar({
  isCollapsed,
  toggleSidebarCollapsed,
  onLinkClick,
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const pathname = usePathname();
  const firstLinkRef = useRef(null);
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    if (pathname.startsWith("/profile/project-manage")) {
      setOpenMenus((m) => ({ ...m, "Project Manage": true }));
    }
  }, [pathname]);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#5E9A2D",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        localStorage.removeItem("user_token");
        localStorage.removeItem("selectedCategory");
        document.cookie = "authToken=; path=/; max-age=0";
        onLinkClick?.();
        router.push("/login");
      }
    });
  };

  // Same visual shell for user + provider; only menu items differ
  const userMenu = [
    { name: "My Profile", icon: <FaUser />, path: "/profile/user" },
    {
      name: "My Projects",
      icon: <FaProjectDiagram />,
      path: "/profile/my-projects",
    },
    { name: "Inbox", icon: <FaComments />, path: "/profile/inbox" },
    {
      name: "Project Manage",
      icon: <FaClipboardList />,
      path: "/profile/project-manage",
      children: [
        {
          name: "Project Report",
          icon: <FaFileAlt />,
          path: "/profile/project-manage/reports",
        },
        {
          name: "System Setup",
          icon: <FaCog />,
          path: "/profile/project-manage/setup",
        },
      ],
    },
    { name: "Wallet", icon: <FaWallet />, path: "/profile/wallet" },
    { name: "Notifications", icon: <FaBell />, path: "/profile/notifications" },
  ];

  const providerMenu = [
    { name: "My Profile", icon: <FaUser />, path: "/profile/user" },
    {
      name: "Current Projects",
      icon: <FaProjectDiagram />,
      path: "/profile/current-projects",
    },
    { name: "Pending Bids", icon: <FaCheckCircle />, path: "/profile/my-bids" },
    { name: "Inbox", icon: <FaComments />, path: "/profile/inbox" },
    {
      name: "Project Manage",
      icon: <FaClipboardList />,
      path: "/profile/project-manage",
      children: [
        {
          name: "Project Report",
          icon: <FaFileAlt />,
          path: "/profile/project-manage/reports",
        },
        {
          name: "System Setup",
          icon: <FaCog />,
          path: "/profile/project-manage/setup",
        },
      ],
    },
    {
      name: "Account Setup",
      icon: <FaStar />,
      path: "/profile/account-setup",
    },
    { name: "Wallet", icon: <FaWallet />, path: "/profile/wallet" },
    { name: "Notifications", icon: <FaBell />, path: "/profile/notifications" },
    { name: "My Review", icon: <FaStar />, path: "/profile/my-review" },
  ];

  const items = user?.role === "provider" ? providerMenu : userMenu;
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !user,
  });
  const inboxUnread = unreadData?.data?.totalUnread || 0;

  return (
    <div
      className={`min-h-[calc(100vh-5rem)] transition-all duration-200 ease-in-out bg-secondary text-gray-800 border-r border-hash/30 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        <div
          className={`flex items-center p-3 sm:p-4 border-b border-hash/30 ${
            isCollapsed ? "justify-center" : "justify-between gap-2"
          }`}
        >
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.14em] text-hash">
                {user?.role === "provider" ? "Provider" : "User"}
              </p>
              <p className="font-bold text-primary truncate text-sm sm:text-base leading-tight">
                {user?.name || "Account"}
              </p>
            </div>
          )}
          <button
            onClick={toggleSidebarCollapsed}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="shrink-0 p-2 rounded-md hover:bg-primary/10 text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {isCollapsed ? <FaArrowRight size={16} /> : <FaArrowLeft size={16} />}
          </button>
        </div>

        {isCollapsed && (
          <div className="px-2 pt-3 flex justify-center" title={user?.name || "Account"}>
            <span className="h-9 w-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <nav className="mt-3 sm:mt-4 flex-1 overflow-y-auto">
          {items.map((item, index) => {
            const children = item.children || [];
            const childActive = children.some(
              (c) =>
                pathname === c.path || pathname.startsWith(`${c.path}/`)
            );
            const parentActive =
              (pathname === item.path ||
                pathname.startsWith(`${item.path}/`)) &&
              !childActive;
            const isInbox = item.path === "/profile/inbox";
            const menuOpen = !!openMenus[item.name];

            if (children.length && !isCollapsed) {
              return (
                <div key={item.name} className="mx-2 mt-1">
                  <div
                    className={`flex items-center rounded-lg transition-colors duration-200 ${
                      parentActive
                        ? "bg-primary text-white font-semibold shadow-sm"
                        : "hover:bg-primary/10 text-gray-700"
                    }`}
                  >
                    <Link
                      href={item.path}
                      ref={index === 0 ? firstLinkRef : null}
                      onClick={() => {
                        setOpenMenus((m) => ({ ...m, [item.name]: true }));
                        onLinkClick?.();
                      }}
                      title={item.name}
                      className="flex items-center flex-1 min-w-0 px-3 py-2.5"
                    >
                      <span className="text-base shrink-0">{item.icon}</span>
                      <span className="mx-3 text-sm truncate flex-1">
                        {item.name}
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`${menuOpen ? "Collapse" : "Expand"} ${item.name}`}
                      onClick={() =>
                        setOpenMenus((m) => ({
                          ...m,
                          [item.name]: !m[item.name],
                        }))
                      }
                      className={`shrink-0 p-2 mr-1 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-md ${
                        parentActive ? "text-white" : "text-gray-600"
                      }`}
                    >
                      <FaChevronDown
                        className={`text-xs transition-transform ${
                          menuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                  {menuOpen && (
                    <div className="mt-1 ml-4 pl-2 border-l border-hash/40 space-y-0.5">
                      {children.map((child) => {
                        const active =
                          pathname === child.path ||
                          pathname.startsWith(`${child.path}/`);
                        return (
                          <Link
                            href={child.path}
                            key={child.name}
                            onClick={onLinkClick}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm min-h-[40px] ${
                              active
                                ? "bg-primary text-white font-semibold"
                                : "hover:bg-primary/10 text-gray-700"
                            }`}
                          >
                            <span className="text-sm shrink-0">{child.icon}</span>
                            <span className="ml-2 truncate">{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                href={item.path}
                key={item.name}
                ref={index === 0 ? firstLinkRef : null}
                onClick={onLinkClick}
                title={item.name}
                className={`flex items-center mx-2 px-3 py-2.5 mt-1 rounded-lg transition-colors duration-200 ${
                  parentActive || (isCollapsed && (parentActive || childActive))
                    ? "bg-primary text-white font-semibold shadow-sm"
                    : "hover:bg-primary/10 text-gray-700"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <span className="text-base shrink-0 relative">
                  {item.icon}
                  {isInbox && <UnreadBadge count={inboxUnread} />}
                </span>
                {!isCollapsed && (
                  <span className="mx-3 text-sm truncate flex-1">{item.name}</span>
                )}
                {!isCollapsed && isInbox && inboxUnread > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                    {inboxUnread > 99 ? "99+" : inboxUnread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-hash/30 pb-4">
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className={`flex items-center w-full mx-0 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <FaSignOutAlt className="text-base shrink-0" />
            {!isCollapsed && (
              <span className="mx-3 text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
