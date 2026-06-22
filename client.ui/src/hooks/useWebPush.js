import { useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/auth";
import { toast } from "react-toastify";

// Replace with the VAPID_PUBLIC_KEY from the server
const PUBLIC_VAPID_KEY = import.meta.env.VITE_PUBLIC_VAPID_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useWebPush = () => {
  const [Auth] = useAuth();
  const loggedInUserId = Auth?.User?._id;

  const subscribeToPush = useCallback(async () => {
    if (!loggedInUserId) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Web Push is not supported in this browser.");
      return;
    }

    try {
      // 1. Register Service Worker
      const registration = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
      });

      // wait for it to be ready
      await navigator.serviceWorker.ready;

      // 2. Request Notification Permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied.");
        return;
      }

      // 3. Subscribe to Push Manager
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        });
      }

      // 4. Send subscription to Backend
      const subJSON = subscription.toJSON();
      await api.post("/users/push-subscribe", subJSON);
      console.log("Successfully subscribed to Web Push Notifications");
      // Optional: uncomment below to see the success toast
      // toast.success("Push notifications enabled!");
      
    } catch (err) {
      console.error("Failed to subscribe to Web Push:", err);
      toast.error("Failed to enable push notifications. See console.");
    }
  }, [loggedInUserId]);

  useEffect(() => {
    // Automatically try to subscribe when user is logged in
    if (loggedInUserId) {
      subscribeToPush();
    }
  }, [loggedInUserId, subscribeToPush]);

  return { subscribeToPush };
};
