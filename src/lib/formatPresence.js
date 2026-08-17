export function formatLastSeen(date, isActive) {
  if (isActive) return "online";
  if (!date) return "offline";
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return "offline";
  const diff = Date.now() - t;
  const sec = Math.max(0, Math.floor(diff / 1000));
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (sec < 45) return "last seen just now";
  if (min < 60) return `last seen ${min} min ago`;
  if (hr < 24) return `last seen ${hr} hour${hr === 1 ? "" : "s"} ago`;
  if (day === 1) return "last seen yesterday";
  if (day < 7) return `last seen ${day} days ago`;
  return `last seen ${new Date(date).toLocaleDateString()}`;
}

export function formatCallDuration(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r} sec`;
  if (r === 0) return `${m} min`;
  return `${m} min ${r} sec`;
}

export function callEventLabel(msg) {
  const status = msg?.callStatus;
  if (status === "completed") {
    return `Audio call · ${formatCallDuration(msg.durationSeconds)}`;
  }
  if (status === "missed") return "Missed audio call";
  if (status === "rejected") return "Call declined";
  if (status === "cancelled") return "Cancelled audio call";
  return msg?.messageText || "Audio call";
}
