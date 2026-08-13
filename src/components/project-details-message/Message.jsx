"use client";

import { SendOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaFlag } from "react-icons/fa";
import { useSelector } from "react-redux";
import default_img from "../../assets/user_img_default.png";
import { useSocket } from "../../context/SocketContext";
import { getImageUrl } from "../../lib/getImageUrl";
import { useMarkChatReadMutation } from "../../redux/features/chat/chatApi";

export default function Message({
  conversationId,
  userId,
  providerData,
  handleReport,
  data,
  handleProjectOk,
  handleProjectNotOk,
  handleProjectDone,
  providerId,
  peerUserId,
  projectStatus,
  isDirect = false,
  hideProjectActions = false,
}) {
  const { user } = useSelector((state) => state.auth) || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [pagination, setPagination] = useState(null);
  const [loadedPages, setLoadedPages] = useState(new Set());
  const [isActive, setIsActive] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const containerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const peerTypingClearRef = useRef(null);
  const router = useRouter();
  const socket = useSocket();
  const [markRead] = useMarkChatReadMutation();

  const peerId =
    peerUserId ||
    (user?.role === "provider"
      ? data?.data?.currentProjects?.projectId?.userId
      : providerId);

  const headerName =
    providerData?.data?.userName ||
    (user?.role === "provider"
      ? providerData?.data?.userName
      : providerData?.data?.currentProjects?.providerId?.name);

  const headerAvatar =
    user?.role === "provider"
      ? getImageUrl(
          providerData?.data?.userImage ||
            providerData?.data?.currentProjects?.providerId?.image,
          default_img.src
        )
      : getImageUrl(
          providerData?.data?.currentProjects?.providerId?.image ||
            providerData?.data?.userImage,
          default_img.src
        );

  const status = projectStatus || data?.data?.currentProjects?.isComplete;
  const canReview = !hideProjectActions && status === "complete";
  const isFinished =
    status === "finished" || data?.data?.currentProjects?.projectId?.isComplete;

  useEffect(() => {
    if (!socket) return;
    const onPresence = (payload) => {
      if (!payload) return;
      const id = payload?._id || payload?.userId;
      if (peerId && String(id) === String(peerId)) {
        setIsActive(Boolean(payload.isActive));
      }
    };
    socket.on("active-inactive", onPresence);
    return () => socket.off("active-inactive", onPresence);
  }, [socket, peerId]);

  useEffect(() => {
    if (loadedPages.has(page) || !conversationId) return;
    const token = localStorage.getItem("user_token");
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/conversation/${conversationId}?page=${page}&limit=${limit}`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((resData) => {
        const previousScrollHeight = containerRef.current?.scrollHeight || 0;
        const loadedMessages = (resData?.data?.data || [])
          .filter((msg) => String(msg.conversationId) === String(conversationId))
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (page === 1) setMessages(loadedMessages);
        else setMessages((prev) => [...loadedMessages, ...prev]);

        setPagination(resData.data.pagination);
        setLoadedPages((prev) => new Set(prev).add(page));

        if (page > 1 && containerRef.current) {
          setTimeout(() => {
            const newScrollHeight = containerRef.current.scrollHeight;
            containerRef.current.scrollTop = newScrollHeight - previousScrollHeight;
          }, 40);
        }
      })
      .catch(console.log);
  }, [conversationId, page, loadedPages]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit("joinConversation", { conversationId });

    const handleReceiveMessage = (message) => {
      if (String(message.conversationId) !== String(conversationId)) return;
      setIsPeerTyping(false);
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(message._id))) return prev;
        return [...prev, message];
      });
      if (String(message.senderId) !== String(userId)) {
        markRead(conversationId);
      }
      setTimeout(() => {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 40);
    };

    const handleTyping = (payload) => {
      if (String(payload?.conversationId) !== String(conversationId)) return;
      if (String(payload?.userId) === String(userId)) return;
      setIsPeerTyping(Boolean(payload?.isTyping));
      if (peerTypingClearRef.current) clearTimeout(peerTypingClearRef.current);
      if (payload?.isTyping) {
        peerTypingClearRef.current = setTimeout(() => setIsPeerTyping(false), 2500);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("typing", handleTyping);
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("typing", handleTyping);
    };
  }, [socket, conversationId, userId, markRead]);

  useEffect(() => {
    if (page === 1 && containerRef.current && messages.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, page]);

  const handleScroll = useCallback(
    (e) => {
      if (e.currentTarget.scrollTop === 0 && pagination && page < pagination.totalPage) {
        setPage((prev) => prev + 1);
      }
    },
    [pagination, page]
  );

  const emitTyping = (isTyping) => {
    if (!socket?.connected || !conversationId) return;
    socket.emit("typing", {
      conversationId,
      userId,
      name: user?.name,
      isTyping,
    });
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1200);
  };

  const handleSend = () => {
    if (!newMessage.trim() || !socket?.connected) return;
    socket.emit("sendMessage", {
      conversationId,
      senderId: userId,
      messageText: newMessage.trim(),
    });
    emitTyping(false);
    setNewMessage("");
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#efeae2]">
      {/* Fixed header — user info + report */}
      <header className="shrink-0 h-[62px] px-3 md:px-4 flex items-center justify-between gap-3 bg-[#f0f2f5] border-b border-[#d1d7db] z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="md:hidden p-2 rounded-full hover:bg-black/5 text-[#54656f]"
            aria-label="Back"
          >
            <FaArrowLeft size={16} />
          </button>
          <div className="relative shrink-0">
            <Image
              src={headerAvatar}
              alt=""
              width={42}
              height={42}
              className="rounded-full h-[42px] w-[42px] object-cover"
            />
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#f0f2f5] ${
                isActive ? "bg-primary" : "bg-[#8696a0]"
              }`}
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-[16px] font-medium text-[#111b21] truncate leading-tight">
              {headerName || "User"}
            </h2>
            <p className="text-[12.5px] text-[#667781] truncate">
              {isPeerTyping ? "typing…" : isActive ? "online" : "offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!hideProjectActions && user?.role === "user" && canReview && !isFinished && (
            <>
              <button
                type="button"
                onClick={handleProjectNotOk}
                className="hidden sm:inline-flex text-xs px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={handleProjectOk}
                className="hidden sm:inline-flex text-xs px-2.5 py-1.5 rounded-lg bg-primary text-white hover:bg-[#4d7f24]"
              >
                Accept
              </button>
            </>
          )}
          {!hideProjectActions && user?.role === "provider" && (
            <button
              type="button"
              onClick={handleProjectDone}
              disabled={canReview || isFinished}
              className="hidden sm:inline-flex text-xs px-2.5 py-1.5 rounded-lg bg-primary text-white disabled:opacity-40"
            >
              {canReview || isFinished ? "Sent" : "Done"}
            </button>
          )}
          {handleReport && (
            <button
              type="button"
              onClick={handleReport}
              className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium px-3 py-2 rounded-lg bg-[#ea4335] text-white hover:bg-[#d33426] transition shadow-sm"
            >
              <FaFlag size={11} />
              Report
            </button>
          )}
        </div>
      </header>

      {/* Scrollable messages only */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3 md:px-12 py-3 chat-wallpaper"
      >
        {messages.length === 0 && (
          <div className="h-full min-h-[200px] flex items-center justify-center">
            <div className="bg-[#ffeecd]/95 text-[#54656f] text-sm px-4 py-2 rounded-lg shadow-sm max-w-sm text-center">
              Messages are end-to-end realtime. Say hello to start the chat.
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = String(msg.senderId) === String(userId);
          return (
            <div
              key={msg._id}
              className={`mb-1 flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-[85%] sm:max-w-[65%] px-2.5 pt-1.5 pb-1 shadow-sm ${
                  isOwn
                    ? "bg-[#E7F2DC] rounded-xl rounded-tr-sm"
                    : "bg-white rounded-xl rounded-tl-sm"
                }`}
              >
                <p className="text-[14.2px] text-[#111b21] whitespace-pre-wrap break-words leading-[1.35] pr-10">
                  {msg.messageText}
                </p>
                <span className="absolute bottom-1 right-2 text-[10.5px] text-[#667781]">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}

        {isPeerTyping && (
          <div className="flex justify-start mb-1">
            <div className="bg-white rounded-xl px-3 py-2 shadow-sm">
              <span className="typing-dots text-[#54656f]">
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Fixed composer */}
      <footer className="shrink-0 bg-[#f0f2f5] px-2 md:px-4 py-2.5 border-t border-[#d1d7db]">
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-lg bg-white px-3 py-1.5 shadow-sm">
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 5 }}
              placeholder="Type a message"
              value={newMessage}
              onChange={handleInputChange}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="!border-0 !shadow-none !resize-none !p-0 text-[15px]"
            />
          </div>
          <Button
            type="primary"
            shape="circle"
            size="large"
            className="!bg-primary hover:!bg-[#4d7f24] !border-0 !w-11 !h-11 !min-w-11 flex items-center justify-center"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!newMessage.trim() || !socket?.connected}
          />
        </div>
        {!socket?.connected && (
          <p className="text-[11px] text-amber-600 mt-1 px-1">Connecting…</p>
        )}
      </footer>

      <style jsx>{`
        .chat-wallpaper {
          background-color: #efeae2;
          background-image: radial-gradient(
              rgba(0, 0, 0, 0.035) 0.6px,
              transparent 0.6px
            ),
            radial-gradient(rgba(0, 0, 0, 0.03) 0.6px, transparent 0.6px);
          background-size: 18px 18px;
          background-position: 0 0, 9px 9px;
        }
        .typing-dots {
          display: inline-flex;
          gap: 3px;
          align-items: center;
          height: 14px;
        }
        .typing-dots i {
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: currentColor;
          display: inline-block;
          animation: bounce 1.1s infinite ease-in-out;
        }
        .typing-dots i:nth-child(2) {
          animation-delay: 0.15s;
        }
        .typing-dots i:nth-child(3) {
          animation-delay: 0.3s;
        }
        @keyframes bounce {
          0%,
          80%,
          100% {
            opacity: 0.35;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }
      `}</style>
    </div>
  );
}
