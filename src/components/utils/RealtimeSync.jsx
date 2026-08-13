"use client";

import { message } from "antd";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import { getImageUrl } from "../../lib/getImageUrl";
import baseApi from "../../redux/api/baseApi";
import { increaseNotification } from "../../redux/slices/authSlice";
import { useNotificationPermission } from "./useNotificationPermission";

/**
 * Keeps lists + notifications in sync over socket without full page reload.
 */
export default function RealtimeSync() {
  useNotificationPermission();
  const dispatch = useDispatch();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const refreshProjects = () => {
      dispatch(baseApi.util.invalidateTags(["projects", "notifications", "socket"]));
    };

    const onNotification = (data) => {
      dispatch(increaseNotification());
      if (typeof window !== "undefined" && Notification.permission === "granted") {
        new Notification(data?.title || "Peared", {
          body: data?.message,
          icon: getImageUrl(data?.image),
        });
      }
    };

    const onBidCreated = (payload) => {
      refreshProjects();
      message.info(
        payload?.providerName
          ? `${payload.providerName} placed a new bid`
          : "New bid received"
      );
    };

    const onBidApproved = () => {
      refreshProjects();
      message.success("A bid was approved — project is now running");
    };

    const onProviderDone = () => {
      refreshProjects();
      message.info("Provider marked work as done — please review");
    };

    const onUserOk = () => {
      refreshProjects();
      message.success("Client accepted the completed work");
    };

    const onUserNotOk = () => {
      refreshProjects();
      message.warning("Client rejected the done request");
    };

    socket.on("receiveNotification", onNotification);
    socket.on("bid:created", onBidCreated);
    socket.on("bid:approved", onBidApproved);
    socket.on("project:providerDone", onProviderDone);
    socket.on("project:userOk", onUserOk);
    socket.on("project:userNotOk", onUserNotOk);

    return () => {
      socket.off("receiveNotification", onNotification);
      socket.off("bid:created", onBidCreated);
      socket.off("bid:approved", onBidApproved);
      socket.off("project:providerDone", onProviderDone);
      socket.off("project:userOk", onUserOk);
      socket.off("project:userNotOk", onUserNotOk);
    };
  }, [dispatch, socket]);

  return null;
}
