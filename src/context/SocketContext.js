"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

const URL = process.env.NEXT_PUBLIC_IMAGE_URL;

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    // console.log(token);
    const newSocket = io(URL, {
      transports: ["websocket"],
      // auth: token,
      query: { token },
      // extraHeaders: {
      //   token,
      // },
    });
    // setSocket(newSocket);
    if (!newSocket.connected) {
      newSocket.on("connect", () => {
        setSocket(newSocket);
      });
    }

    return () => newSocket.close();
  }, []);

  // console.log(socket);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
