"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useSocket } from "./SocketContext";

const CallContext = createContext(null);

const getIceServers = () => {
  const servers = [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ];
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_TURN_URL) {
    servers.push({
      urls: process.env.NEXT_PUBLIC_TURN_URL,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
    });
  }
  return servers;
};

const idle = {
  status: "idle",
  conversationId: null,
  peerId: null,
  peerName: "",
  peerAvatar: "",
  muted: false,
  startedAt: null,
  error: "",
};

export const useCall = () => useContext(CallContext);

export function CallProvider({ children }) {
  const socket = useSocket();
  const { user } = useSelector((s) => s.auth) || {};
  const [call, setCall] = useState(idle);
  const callRef = useRef(idle);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const ringTimerRef = useRef(null);
  const pendingIceRef = useRef([]);
  const remoteReadyRef = useRef(false);

  const setCallBoth = (next) => {
    const value = typeof next === "function" ? next(callRef.current) : next;
    callRef.current = value;
    setCall(value);
  };

  const cleanupMedia = useCallback(() => {
    if (ringTimerRef.current) {
      clearTimeout(ringTimerRef.current);
      ringTimerRef.current = null;
    }
    pcRef.current?.getSenders?.().forEach((s) => {
      try {
        s.track?.stop();
      } catch {
        /* ignore */
      }
    });
    localStreamRef.current?.getTracks?.().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {
        /* ignore */
      }
      pcRef.current = null;
    }
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    pendingIceRef.current = [];
    remoteReadyRef.current = false;
  }, []);

  const resetCall = useCallback(
    (error = "") => {
      cleanupMedia();
      setCallBoth({ ...idle, error });
    },
    [cleanupMedia]
  );

  const createPeer = useCallback(
    (conversationId) => {
      const pc = new RTCPeerConnection({ iceServers: getIceServers() });
      pcRef.current = pc;
      pendingIceRef.current = [];
      remoteReadyRef.current = false;
      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
      pc.onicecandidate = (e) => {
        if (!e.candidate || !socket) return;
        socket.emit("call:signal", {
          conversationId,
          candidate: e.candidate,
        });
      };
      pc.ontrack = (e) => {
        const stream = e.streams?.[0];
        if (remoteAudioRef.current && stream) {
          remoteAudioRef.current.srcObject = stream;
          remoteAudioRef.current.play().catch(() => {});
        }
      };
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "connected") {
          socket?.emit("call:started");
          setCallBoth((c) =>
            c.status === "idle"
              ? c
              : { ...c, status: "in-call", startedAt: c.startedAt || Date.now() }
          );
        }
        // Brief ICE drops often show as "disconnected" then recover — hang up only on failed.
        if (state === "failed" && callRef.current.status !== "idle") {
          socket?.emit("call:end", { reason: "hangup" });
          resetCall("Call dropped");
        }
      };
      return pc;
    },
    [socket, resetCall]
  );

  const getMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    localStreamRef.current = stream;
    return stream;
  };

  const startCall = useCallback(
    async ({ conversationId, peerId, peerName, peerAvatar }) => {
      if (!socket || !user || callRef.current.status !== "idle") return;
      try {
        await getMic();
      } catch {
        setCallBoth({ ...idle, error: "Microphone permission is required." });
        return;
      }
      setCallBoth({
        ...idle,
        status: "outgoing",
        conversationId,
        peerId,
        peerName: peerName || "User",
        peerAvatar: peerAvatar || "",
      });
      socket.emit("call:invite", { conversationId });
      ringTimerRef.current = setTimeout(() => {
        if (callRef.current.status === "outgoing") {
          socket.emit("call:end", { reason: "no-answer" });
          resetCall("No answer");
        }
      }, 40000);
    },
    [socket, user, resetCall]
  );

  const acceptCall = useCallback(async () => {
    const current = callRef.current;
    if (!socket || current.status !== "incoming") return;
    try {
      await getMic();
    } catch {
      socket.emit("call:reject", { conversationId: current.conversationId });
      resetCall("Microphone permission is required.");
      return;
    }
    createPeer(current.conversationId);
    setCallBoth({ ...current, status: "connecting" });
    socket.emit("call:accept", { conversationId: current.conversationId });
  }, [socket, createPeer, resetCall]);

  const rejectCall = useCallback(() => {
    const current = callRef.current;
    if (!socket || current.status === "idle") return;
    socket.emit("call:reject", { conversationId: current.conversationId });
    resetCall();
  }, [socket, resetCall]);

  const endCall = useCallback(() => {
    if (callRef.current.status === "idle") return;
    socket?.emit("call:end", { reason: "hangup" });
    resetCall();
  }, [socket, resetCall]);

  const toggleMute = useCallback(() => {
    const next = !callRef.current.muted;
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !next;
    });
    setCallBoth((c) => ({ ...c, muted: next }));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onIncoming = (payload) => {
      if (callRef.current.status !== "idle") {
        socket.emit("call:reject", {
          conversationId: payload.conversationId,
          reason: "busy",
        });
        return;
      }
      setCallBoth({
        ...idle,
        status: "incoming",
        conversationId: payload.conversationId,
        peerId: payload.fromId,
        peerName: payload.fromName || "Incoming call",
        peerAvatar: payload.fromImage || "",
      });
    };

    const onAccepted = async (payload) => {
      if (callRef.current.status !== "outgoing") return;
      if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
      const pc = createPeer(payload.conversationId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("call:signal", {
          conversationId: payload.conversationId,
          sdp: pc.localDescription,
        });
        setCallBoth((c) => ({ ...c, status: "connecting" }));
      } catch (err) {
        console.error(err);
        socket.emit("call:end", { reason: "hangup" });
        resetCall("Could not start the call");
      }
    };

    const flushIce = async (pc) => {
      const queued = pendingIceRef.current;
      pendingIceRef.current = [];
      for (const candidate of queued) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("ice flush", err);
        }
      }
    };

    const onSignal = async (payload) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        if (payload.sdp?.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          remoteReadyRef.current = true;
          await flushIce(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("call:signal", {
            conversationId: payload.conversationId,
            sdp: pc.localDescription,
          });
        } else if (payload.sdp?.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          remoteReadyRef.current = true;
          await flushIce(pc);
        } else if (payload.candidate) {
          if (!remoteReadyRef.current) {
            pendingIceRef.current.push(payload.candidate);
            return;
          }
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        }
      } catch (err) {
        console.error("call:signal", err);
      }
    };

    const onEnded = () => resetCall();
    const onBusy = () => resetCall("User is on another call");
    const onUnavailable = () => resetCall("User is offline");
    const onError = (payload) => resetCall(payload?.message || "Call failed");

    socket.on("call:incoming", onIncoming);
    socket.on("call:accepted", onAccepted);
    socket.on("call:signal", onSignal);
    socket.on("call:ended", onEnded);
    socket.on("call:busy", onBusy);
    socket.on("call:unavailable", onUnavailable);
    socket.on("call:error", onError);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:accepted", onAccepted);
      socket.off("call:signal", onSignal);
      socket.off("call:ended", onEnded);
      socket.off("call:busy", onBusy);
      socket.off("call:unavailable", onUnavailable);
      socket.off("call:error", onError);
    };
  }, [socket, createPeer, resetCall]);

  useEffect(() => () => cleanupMedia(), [cleanupMedia]);

  return (
    <CallContext.Provider
      value={{
        call,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        remoteAudioRef,
        dismissError: () => setCallBoth(idle),
      }}
    >
      {children}
    </CallContext.Provider>
  );
}
