import { useEffect } from "react";

export const useNotificationPermission = () => {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      Notification.permission !== "granted"
    ) {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);
};
