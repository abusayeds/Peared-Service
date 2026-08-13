"use client";

import Link from "next/link";

/** Small red unread badge for inbox icons */
export default function UnreadBadge({ count = 0 }) {
  if (!count || count < 1) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function InboxNavLink({
  href = "/profile/inbox",
  icon,
  label,
  count = 0,
  className = "",
  labelClassName = "",
  onClick,
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative inline-flex items-center ${className}`}
    >
      <span className="relative inline-flex">
        {icon}
        <UnreadBadge count={count} />
      </span>
      {label != null && (
        <span className={labelClassName}>{label}</span>
      )}
    </Link>
  );
}
