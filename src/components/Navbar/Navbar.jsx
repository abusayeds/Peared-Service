"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FaBars, FaBell, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import main_logo from "../../assets/main_logo.svg";
import { logout } from "../../redux/slices/authSlice";

function getDashboardHref(role) {
  if (role === "provider") return "/profile/current-projects";
  if (role === "user") return "/profile/my-projects";
  return "/login";
}

export default function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((v) => !v);

  const isLoggedIn = user?.role === "user" || user?.role === "provider";
  const isUser = user?.role === "user";
  const isProvider = user?.role === "provider";
  // Guests + users browse providers; providers do not
  const canSeeProviders = !isProvider;
  const dashboardHref = getDashboardHref(user?.role);

  const navigation = [{ name: "Home", href: "/" }];

  // Guests + providers see Projects; logged-in users do not
  // Guests + users see Providers; logged-in providers do not
  const navigationSm = [
    { name: "Home", href: "/" },
    ...(!isUser ? [{ name: "Projects", href: "/projects" }] : []),
    ...(canSeeProviders ? [{ name: "Providers", href: "/providers" }] : []),
    { name: "About Us", href: "/about-us" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms-of-use" },
  ];

  const isActive = (href) =>
    pathname === href || pathname.startsWith(`${href}/`);

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
        closeMenu();
        router.push("/login");
      }
    });
  };

  return (
    <nav className="bg-secondary shadow-md fixed w-full p-2 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          <Link href="/" className="flex-shrink-0" onClick={closeMenu}>
            <Image width={70} height={70} src={main_logo} alt="Peared" />
          </Link>

          <div className="hidden md:flex md:items-center gap-2 lg:gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive(item.href)
                    ? "text-primary underline"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {!isUser && (
              <Link
                href="/projects"
                className={`px-3 py-2 text-sm font-medium transition ${
                  isActive("/projects")
                    ? "text-primary underline"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                Projects
              </Link>
            )}

            {canSeeProviders && (
              <Link
                href="/providers"
                className={`px-3 py-2 text-sm font-medium transition ${
                  isActive("/providers")
                    ? "text-primary underline"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                Providers
              </Link>
            )}

            {isLoggedIn ? (
              <>
                <Link
                  href="/profile/notifications"
                  className="p-2 text-primary hover:text-primary/80"
                  aria-label="Notifications"
                >
                  <FaBell size={20} />
                </Link>
                <Link
                  href={dashboardHref}
                  className={`px-3 py-2 rounded-md text-sm font-bold transition ${
                    pathname.startsWith("/profile")
                      ? "bg-primary text-white"
                      : "text-primary border border-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link
                  href="/signup"
                  className="text-sm font-medium text-gray-800 underline hover:text-primary"
                >
                  Sign up
                </Link>
                <Link
                  href="/join-contractor"
                  className="text-sm font-medium text-gray-800 underline hover:text-primary hidden lg:inline"
                >
                  Join as Contractor
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-white text-primary border border-primary rounded-md text-sm font-medium hover:text-white hover:bg-primary transition"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile/notifications"
                  className="p-2 text-primary"
                  aria-label="Notifications"
                >
                  <FaBell size={20} />
                </Link>
                <Link
                  href={dashboardHref}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-md border border-primary text-primary"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="px-2.5 py-1.5 text-xs font-bold rounded-md border border-primary text-primary"
              >
                Login
              </Link>
            )}
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 md:hidden transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeMenu}
        />
        <div
          className={`absolute left-0 top-0 bottom-0 w-[min(100%,18rem)] bg-secondary shadow-lg transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-hash/40">
            <Link href="/" onClick={closeMenu}>
              <Image width={64} height={64} src={main_logo} alt="Peared" />
            </Link>
            <button
              onClick={closeMenu}
              className="p-2 rounded-md text-gray-700 hover:bg-primary/10"
              aria-label="Close menu"
            >
              <FaTimes size={22} />
            </button>
          </div>

          <nav className="mt-2 pb-8 overflow-y-auto max-h-[calc(100vh-5rem)]">
            {isLoggedIn && (
              <div className="px-6 py-3 mb-2">
                <p className="text-xs uppercase tracking-wide text-hash">Signed in</p>
                <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
              </div>
            )}

            {navigationSm.map((item) => (
              <Link
                href={item.href}
                key={item.name}
                onClick={closeMenu}
                className={`flex items-center px-6 py-3 ${
                  isActive(item.href)
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-gray-700 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {item.name}
              </Link>
            ))}

            <hr className="my-3 border-hash/30" />

            {isLoggedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={closeMenu}
                  className="flex items-center px-6 py-3 font-bold text-primary"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-6 py-3 text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/join-contractor"
                  onClick={closeMenu}
                  className="block px-6 py-3 text-gray-800 underline hover:text-primary"
                >
                  Join as Contractor
                </Link>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="mx-6 mt-2 block text-center px-4 py-2.5 bg-primary text-white rounded-md text-sm font-medium"
                >
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
}
