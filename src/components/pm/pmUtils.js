export const money = (n, fallback = "—") => {
  if (n === null || n === undefined || n === "") return fallback;
  const num = Number(n);
  if (Number.isNaN(num) || num === 0) return fallback;
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const ymd = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 10);
};

export const statusMeta = {
  ongoing: {
    label: "Ongoing",
    badge: "bg-sky-100 text-sky-700",
    bar: "bg-sky-500",
    card: "bg-emerald-50",
  },
  onhold: {
    label: "Onhold",
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
    card: "bg-amber-50",
  },
  finished: {
    label: "Finished",
    badge: "bg-violet-100 text-violet-700",
    bar: "bg-violet-500",
    card: "bg-violet-50",
  },
};

export const priorityMeta = {
  High: "bg-red-100 text-red-600",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
};

export const hexSoft = (hex, extra = "22") => `${hex || "#5E9A2D"}${extra}`;
