"use client";

import { Spin, Tag } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import default_img from "../../../assets/user_img_default.png";
import { getImageUrl } from "../../../lib/getImageUrl";
import { useGetInboxQuery } from "../../../redux/features/chat/chatApi";

export default function InboxPage() {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetInboxQuery(undefined, { skip: !user });

  const conversations = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-secondary/60 to-white pb-24 md:pb-8">
      <div className="px-4 pt-4">
        <p className="text-[11px] uppercase tracking-wider text-hash">Messages</p>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Inbox</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-xl">
          One chat per provider. Send offers anytime — linked projects show in
          each thread.
        </p>
      </div>

      <div className="mt-4 px-4 max-w-2xl space-y-2">
        {conversations.length === 0 ? (
          <div className="rounded-xl border border-hash/25 bg-white p-6 text-center text-gray-600">
            <p className="font-medium">No conversations yet.</p>
            {user?.role === "user" && (
              <Link
                href="/providers"
                className="inline-block mt-3 text-primary font-semibold underline"
              >
                Find a provider
              </Link>
            )}
          </div>
        ) : (
          conversations.map((c) => {
            const peer =
              user?.role === "provider" ? c.userId : c.providerId;
            const preview = c.lastMessage?.messageText || "Say hello…";
            const unread = c.unreadCount || 0;
            const projects = (c.projects || []).filter(
              (p) => p.status !== "finished" && !p.projectComplete
            );
            return (
              <Link
                key={c._id}
                href={`/profile/inbox/${c._id}`}
                className={`flex items-center gap-3 rounded-xl border p-3 hover:border-primary/40 hover:shadow-sm transition ${
                  unread
                    ? "border-primary/40 bg-secondary/50"
                    : "border-hash/25 bg-white"
                }`}
              >
                <div className="relative shrink-0">
                  <Image
                    src={getImageUrl(peer?.image, default_img.src)}
                    alt={peer?.name || "User"}
                    width={48}
                    height={48}
                    className="rounded-full h-12 w-12 object-cover border border-hash/30"
                  />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[1.15rem] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate ${
                        unread
                          ? "font-bold text-gray-900"
                          : "font-semibold text-gray-900"
                      }`}
                    >
                      {peer?.name || "User"}
                    </p>
                    {projects.length > 0 ? (
                      <span className="shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {projects.length} project{projects.length > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary text-primary border border-primary/20">
                        Chat
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm truncate ${
                      unread ? "text-gray-800 font-medium" : "text-gray-500"
                    }`}
                  >
                    {preview}
                  </p>
                  {projects.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {projects.slice(0, 3).map((p) => (
                        <Tag key={p.projectId} className="m-0 text-[10px]">
                          {p.projectName || p.projectCategory}
                        </Tag>
                      ))}
                      {projects.length > 3 && (
                        <Tag className="m-0 text-[10px]">+{projects.length - 3}</Tag>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
