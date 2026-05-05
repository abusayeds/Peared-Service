"use client";

import Link from "next/link";
import { useSelector } from "react-redux";

const PaymentSuccess = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      {/* Card Container */}
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        {/* Success Icon */}
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-green-600 mb-2">
          Payment Successful!
        </h2>

        {/* Description */}
        <p className="text-gray-600">
          Thank you for your purchase. Your transaction has been completed.
          We’ve sent you a confirmation email with the order details.
        </p>

        {/* Action Button */}
        <Link
          href={user?.email ? "/projects" : "/login"}
          className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          {user?.email ? "Go to Projects" : "Go to Login"}{" "}
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
