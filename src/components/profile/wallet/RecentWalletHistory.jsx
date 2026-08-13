"use client";

import { format } from "date-fns";
import { useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { useRecentPaymentHistoryQuery } from "../../../redux/features/payment/paymentApi";
import { Pagination, Spin } from "antd";

export default function RecentWalletHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useRecentPaymentHistoryQuery({ page });
  const historyData = data?.data?.paymentHistory || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-[200px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-hash/25 rounded-2xl shadow-sm overflow-hidden w-full">
      <div className="px-5 py-4 border-b border-hash/20 bg-secondary/50 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-hash">Activity</p>
          <h3 className="text-lg font-bold text-gray-900">Recent History</h3>
        </div>
      </div>

      {historyData.length === 0 ? (
        <div className="px-5 py-12 text-center text-gray-500 text-sm">
          No wallet activity yet.
        </div>
      ) : (
        <ul className="divide-y divide-hash/15">
          {historyData.map((transaction) => {
            const isDeposit = transaction.paymentType === "deposit";
            return (
              <li
                key={transaction._id || `${transaction.createdAt}-${transaction.balance}`}
                className="px-4 sm:px-5 py-3.5 flex items-center gap-3 hover:bg-secondary/40 transition"
              >
                <span
                  className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    isDeposit
                      ? "bg-primary/15 text-primary"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {isDeposit ? <FaArrowDown size={14} /> : <FaArrowUp size={14} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {transaction.historyName || (isDeposit ? "Deposit" : "Withdraw")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.createdAt
                      ? format(new Date(transaction.createdAt), "dd MMM yyyy, hh:mm a")
                      : "—"}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-bold ${
                    isDeposit ? "text-primary" : "text-red-500"
                  }`}
                >
                  {isDeposit ? "+" : "−"}$
                  {Number(transaction.balance || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex justify-center py-4 border-t border-hash/15 bg-white">
        <Pagination
          size="small"
          showSizeChanger={false}
          total={data?.data?.pagination?.totalData || 0}
          current={page}
          onChange={setPage}
          pageSize={5}
        />
      </div>
    </div>
  );
}
