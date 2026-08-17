"use client";

import { useEffect, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaPhoneSlash } from "react-icons/fa";
import { useCall } from "../../context/CallContext";
import { getImageUrl } from "../../lib/getImageUrl";

function formatElapsed(startedAt) {
  if (!startedAt) return "00:00";
  const s = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

export default function CallOverlay() {
  const ctx = useCall();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (ctx?.call?.status !== "in-call") return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [ctx?.call?.status]);

  if (!ctx) return null;
  const {
    call,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    remoteAudioRef,
    dismissError,
  } = ctx;

  const title =
    call.status === "incoming"
      ? "Incoming audio call"
      : call.status === "outgoing"
        ? "Calling…"
        : call.status === "connecting"
          ? "Connecting…"
          : call.status === "in-call"
            ? formatElapsed(call.startedAt)
            : "Call";

  return (
    <>
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      {call.error && call.status === "idle" && (
        <div className="fixed inset-x-0 bottom-20 md:bottom-6 z-[80] flex justify-center px-4">
          <div className="bg-white border border-hash/40 shadow-lg rounded-xl px-4 py-3 max-w-sm w-full flex items-center justify-between gap-3">
            <p className="text-sm text-gray-700">{call.error}</p>
            <button
              type="button"
              onClick={dismissError}
              className="text-primary text-sm font-semibold min-h-[40px]"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {call.status !== "idle" && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-sm bg-secondary rounded-t-2xl sm:rounded-2xl p-6 text-center shadow-xl">
            <img
              src={getImageUrl(call.peerAvatar)}
              alt=""
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-primary"
            />
            <p className="font-semibold text-gray-900 text-lg truncate">
              {call.peerName || "User"}
            </p>
            <p className="text-sm text-gray-500 mt-1">{title}</p>
            <p className="text-xs text-hash mt-1">Audio call</p>

            <div className="mt-6 flex items-center justify-center gap-4">
              {call.status === "incoming" ? (
                <>
                  <button
                    type="button"
                    onClick={rejectCall}
                    className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center"
                    aria-label="Decline"
                  >
                    <FaPhoneSlash />
                  </button>
                  <button
                    type="button"
                    onClick={acceptCall}
                    className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center"
                    aria-label="Accept"
                  >
                    <FaPhone />
                  </button>
                </>
              ) : (
                <>
                  {call.status === "in-call" && (
                    <button
                      type="button"
                      onClick={toggleMute}
                      className={`w-14 h-14 rounded-full flex items-center justify-center ${
                        call.muted
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-700 border border-hash/40"
                      }`}
                      aria-label={call.muted ? "Unmute" : "Mute"}
                    >
                      {call.muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={call.status === "outgoing" ? rejectCall : endCall}
                    className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center"
                    aria-label="End call"
                  >
                    <FaPhoneSlash />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <span className="hidden">{tick}</span>
    </>
  );
}
