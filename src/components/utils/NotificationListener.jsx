"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import { increaseNotification } from "../../redux/slices/authSlice";
import { getImageUrl } from "../../lib/getImageUrl";
import { useNotificationPermission } from "./useNotificationPermission";

export default function NotificationListener() {
  useNotificationPermission();
  const dispatch = useDispatch();
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      const handleSocketNotification = (data) => {
        dispatch(increaseNotification());
        if (Notification.permission === "granted") {
          new Notification(data.title, {
            body: data.message,
            icon: getImageUrl(data?.image),
          });
        }
      };

      socket.on("receiveNotification", handleSocketNotification);

      return () => {
        socket.off("receiveNotification", handleSocketNotification);
      };
    }
  }, [dispatch, socket]);

  return null;
}
