"use client";

import { SendOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import default_img from "../../assets/user_img_default.png";
import { useSocket } from "../../context/SocketContext";

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
}) {
  const { user } = useSelector((state) => state.auth) || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [pagination, setPagination] = useState(null);
  const [loadedPages, setLoadedPages] = useState(new Set());
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef(null);

  const router = useRouter();

  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on("active-inactive", (data) => {
        console.log("Ami Active ");
        if (!data) {
          return;
        }
        if (providerId === data?._id) {
          console.log("BAr Bar---");
          setIsActive(data.isActive);
        }
      });
    }
  }, [socket, providerId]);

  useEffect(() => {
    if (loadedPages.has(page)) return;
    const token = localStorage.getItem("user_token");
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/conversation/${conversationId}?page=${page}&limit=${limit}`,
      {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const previousScrollHeight = containerRef.current?.scrollHeight || 0;
        const loadedMessages = data?.data?.data.filter(
          (msg) => msg.conversationId === conversationId
        );
        loadedMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        if (page === 1) {
          setMessages(loadedMessages);
        } else {
          setMessages((prev) => [...loadedMessages, ...prev]);
        }
        setPagination(data.data.pagination);
        setLoadedPages((prev) => new Set(prev).add(page));
        if (page > 1 && containerRef.current) {
          setTimeout(() => {
            const newScrollHeight = containerRef.current.scrollHeight;
            containerRef.current.scrollTop =
              newScrollHeight - previousScrollHeight;
          }, 50);
        }
      })
      .catch((err) => console.log(err));
  }, [conversationId, page, loadedPages]);

  useEffect(() => {
    if (socket && conversationId) {
      console.log("Conversation Joined");
      socket.emit("joinConversation", { conversationId });
      console.log("Conversation Joined2");
      const handleReceiveMessage = (message) => {
        if (message.conversationId === conversationId) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
          if (containerRef.current) {
            const { scrollTop, clientHeight, scrollHeight } =
              containerRef.current;
            if (scrollHeight - scrollTop - clientHeight < 50) {
              setTimeout(() => {
                containerRef.current.scrollTo({
                  top: containerRef.current.scrollHeight,
                  behavior: "smooth",
                });
              }, 50);
            }
          }
        }
      };

      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [socket, conversationId]);

  useEffect(() => {
    if (page === 1 && containerRef.current && messages.length > 0) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, page]);

  const handleScroll = useCallback(
    (e) => {
      const { scrollTop } = e.currentTarget;
      if (scrollTop === 0 && pagination && page < pagination.totalPage) {
        setPage((prev) => prev + 1);
      }
    },
    [pagination, page]
  );

  const handleSend = () => {
    if (!newMessage.trim()) return;

    if (socket) {
      const outgoingMsg = {
        conversationId,
        senderId: userId,
        messageText: newMessage.trim(),
      };
      socket.emit("sendMessage", outgoingMsg);
      setNewMessage("");
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 50);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-[80vh] md:h-[70vh] bg-secondary rounded-lg shadow-md w-full max-w-4xl mx-auto pb-8">
      <div className="flex justify-between items-center mx-2">
        {user?.role === "provider" ? (
          <div className=" flex items-center py-2 border-b flex-shrink-0">
            <button
              onClick={() => router.back()}
              className=" text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Go Back"
            >
              <FaArrowLeft size={20} />
            </button>
            <Image
              src={
                providerData?.data?.userImage
                  ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${providerData?.data?.userImage}`
                  : default_img.src
              }
              alt="Avatar"
              width={1000}
              height={1000}
              objectFit="cover"
              className="rounded-full h-12 w-12 object-cover"
            />
            <div className="ml-2">
              <div className="flex items-center gap-1">
                <h2 className="text-lg sm:text-xl font-bold leading-none">
                  {providerData?.data?.userName}
                </h2>
                {/* show  this green icon conditionally */}
                {isActive && (
                  <p className="rounded-full w-1 h-1 p-1 bg-green-600 mt-2">
                    {" "}
                  </p>
                )}
              </div>

              <button
                onClick={handleReport}
                className="block md:hidden bg-red-600 text-white text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 rounded-md shadow-md hover:bg-red-700 transition"
              >
                Report
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center py-2 border-b flex-shrink-0">
            <button
              onClick={() => router.back()}
              className=" text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Go Back"
            >
              <FaArrowLeft size={20} />
            </button>
            <Image
              src={
                providerData?.data?.currentProjects?.providerId?.image
                  ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/${providerData?.data?.currentProjects?.providerId?.image}`
                  : default_img.src
              }
              alt="Avatar"
              width={100}
              height={100}
              objectFit="cover"
              className="rounded-full h-12 w-12 object-cover"
            />
            <div className="ml-2">
              <div className="flex items-center gap-1">
                <h2 className="text-lg sm:text-xl font-bold leading-none">
                  {providerData?.data?.currentProjects?.providerId?.name}
                </h2>
                {isActive && (
                  <p className="rounded-full w-1 h-1 p-1 bg-green-600 mt-2">
                    {" "}
                  </p>
                )}
              </div>

              <button
                onClick={handleReport}
                className="block md:hidden bg-red-600 text-white text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 rounded-md shadow-md hover:bg-red-700 transition"
              >
                Report
              </button>
            </div>
          </div>
        )}
        <div>
          {/* <button
            onClick={handleReport}
            className="block md:hidden bg-red-600 text-white text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 rounded-md shadow-md hover:bg-red-700 transition"
          >
            Report
          </button> */}
          {/* <div className=" block md:hidden">Report</div> */}
          <div className=" block md:hidden bg-gray-50 rounded-lg flex-1">
            {user?.role === "user" ? (
              <div className="relative">
                {data?.data?.currentProjects?.isComplete !== "complete" && (
                  <div className="w-full h-full rounded-lg absolute bg-gray-500/50"></div>
                )}
                <div className="p-2">
                  {/* <h3 className="font-semibold text-center mb-2 text-sm md:text-base">
                    Did you get services Done?
                  </h3> */}
                  {/* <p className="text-xs md:text-sm text-center mb-2">
                    {data?.data?.currentProjects?.isComplete !== "complete"
                      ? "After completing this project you can access these buttons."
                      : ""}
                  </p> */}
                  <div className=" flex justify-center items-center gap-4">
                    <button
                      onClick={handleProjectNotOk}
                      className="border border-red-500 text-red-700 text-xs md:text-sm px-3 md:px-5 py-1 md:py-2 rounded-xl font-medium shadow-md hover:bg-red-200 transition"
                    >
                      No
                    </button>
                    <button
                      onClick={handleProjectOk}
                      className="bg-green-600 text-white text-xs md:text-sm px-3 md:px-5 py-1 md:py-2 rounded-xl font-medium shadow-md hover:bg-green-700 transition"
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2 md:p-4">
                {/* <h3 className="font-semibold text-center mb-2 text-sm md:text-base">
                  Is your work done?
                </h3>
                <p className="text-xs md:text-sm text-center mb-2">
                  {
                    "If you click this button, we'll send your client a work done request. If they approve, you get your payment."
                  }
                </p> */}
                <div className="mt-4 flex justify-center items-center">
                  <button
                    onClick={handleProjectDone}
                    className="bg-green-600 text-white text-xs md:text-sm px-3 md:px-5 py-1 md:py-2 rounded-xl font-medium shadow-md hover:bg-green-700 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50"
      >
        {messages?.map((msg) => {
          const isOwnMessage = msg.senderId === userId;

          const avatarSrc =
            user?.role === "provider"
              ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/${
                  providerData?.data?.userImage || default_img.src
                }`
              : `${process.env.NEXT_PUBLIC_IMAGE_URL}/${
                  providerData?.data?.currentProjects?.providerId?.image ||
                  default_img.src
                }`;

          return (
            <div
              key={msg._id}
              className={`mb-3 flex items-end ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              {!isOwnMessage && (
                <div className="mr-2">
                  <Image
                    src={avatarSrc}
                    alt="Avatar"
                    width={100}
                    height={100}
                    objectFit="cover"
                    className="rounded-full h-8 w-8 object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col">
                <div
                  className={` px-2 py-1 max-w-xs sm:max-w-sm break-words ${
                    isOwnMessage
                      ? "bg-[#568C29] text-white rounded-t-lg rounded-bl-lg"
                      : "bg-white text-black border border-gray-300 rounded-t-lg rounded-br-lg"
                  }`}
                >
                  <p className=" text-xs md:text-sm ">{msg.messageText}</p>
                </div>
                <p
                  className={`text-xs text-gray-500 block mt-1 ${
                    isOwnMessage ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t p-2 md:p-4 flex items-end gap-2 flex-shrink-0">
        <Input
          style={{
            height: "50px",
          }}
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onPressEnter={handleSend}
          className="flex-1"
        />
        <Button
          type="primary"
          className="p-4 sm:p-4"
          icon={<SendOutlined />}
          onClick={handleSend}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
