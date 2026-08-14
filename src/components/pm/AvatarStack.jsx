"use client";

import Image from "next/image";
import { getImageUrl } from "../../lib/getImageUrl";

export default function AvatarStack({ people = [], max = 4, size = 28 }) {
  const list = (people || []).filter(Boolean);
  const shown = list.slice(0, max);
  const extra = list.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <span
          key={p._id || i}
          title={p.name}
          className="relative rounded-full border-2 border-white overflow-hidden bg-secondary shrink-0"
          style={{
            width: size,
            height: size,
            marginLeft: i === 0 ? 0 : -8,
            zIndex: 10 - i,
          }}
        >
          <Image
            src={getImageUrl(p.image)}
            alt={p.name || "user"}
            width={size}
            height={size}
            className="object-cover w-full h-full"
          />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="relative rounded-full border-2 border-white bg-gray-200 text-gray-600 text-[10px] font-semibold flex items-center justify-center"
          style={{ width: size, height: size, marginLeft: -8 }}
        >
          +{extra}
        </span>
      )}
      {list.length === 0 && (
        <span className="text-xs text-gray-400">Unassigned</span>
      )}
    </div>
  );
}
