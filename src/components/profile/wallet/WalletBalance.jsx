"use client";

import Image from "next/image";
import wallet_img from "../../../assets/payment/wallet_img.png";

export default function WalletBalance({ balance }) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative rounded-2xl overflow-hidden border border-hash/25 bg-secondary shadow-sm">
        <Image
          src={wallet_img}
          alt="wallet"
          className="w-full object-contain opacity-95"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <p className="text-primary text-xs sm:text-sm font-semibold uppercase tracking-wide">
            Available balance
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            $
            {balance != null
              ? Number(balance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00"}
          </h2>
        </div>
      </div>
    </div>
  );
}
