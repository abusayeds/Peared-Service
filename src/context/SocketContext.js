"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

/**
 * NEXT_PUBLIC_API_URL is like:
 *   https://host/peared/api/v1  or  http://localhost:8000/api/v1
 * Socket.IO treats URL path as a *namespace*, so we must connect to origin only.
 * If API is behind a /peared prefix, Engine.IO path becomes /peared/socket.io.
 *
 * Production (Vercel → Render): set NEXT_PUBLIC_API_URL to your Render API
 * (e.g. https://peared-backend.onrender.com/api/v1). Sockets run on Render,
 * not on Vercel serverless.
 */
function getSocketConfig() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return { url: undefined, path: "/socket.io" };
  }
  try {
    const parsed = new URL(apiUrl);
    const pathPrefix = parsed.pathname.replace(/\/api\/v1\/?$/, "") || "";
    return {
      url: parsed.origin,
      path: pathPrefix ? `${pathPrefix}/socket.io` : "/socket.io",
    };
  } catch {
    return { url: apiUrl, path: "/socket.io" };
  }
}

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.auth) || {};

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token || !user) {
      setSocket(null);
      return;
    }

    const { url, path } = getSocketConfig();
    if (!url) return;

    const newSocket = io(url, {
      path,
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 12,
      reconnectionDelay: 1000,
      query: { token },
    });

    const onConnect = () => setSocket(newSocket);
    const onDisconnect = () =>
      setSocket((prev) => (prev === newSocket ? null : prev));

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);

    if (newSocket.connected) {
      setSocket(newSocket);
    }

    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
