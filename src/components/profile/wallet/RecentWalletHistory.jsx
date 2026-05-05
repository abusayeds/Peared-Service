import { List, Pagination, Spin, Tag, Typography } from "antd";

import { format } from "date-fns";
import { useState } from "react";
import { useRecentPaymentHistoryQuery } from "../../../redux/features/payment/paymentApi";

const { Title, Text } = Typography;

export default function RecentWalletHistory() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useRecentPaymentHistoryQuery({ page });

  const historyData = data?.data?.paymentHistory || [];

  const [currentPage, setCurrentPage] = useState(1); // State to keep track of the current page

  const formattedTransactions = historyData
    ?.slice((currentPage - 1) * 10, currentPage * 10) // Slice data based on current page
    .map((transaction) => {
      return {
        label: transaction.historyName,
        amount:
          transaction.paymentType === "deposit"
            ? `+ $${transaction.balance}`
            : `- $${transaction.balance}`,
        date: format(new Date(transaction.createdAt), "dd MMM yyyy, hh:mm a"),
        color: transaction.paymentType === "deposit" ? "green" : "red",
      };
    });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-96 mx-auto">
        <Title level={4} className="text-gray-800 mb-6">
          Recent History
        </Title>

        <List
          itemLayout="horizontal"
          dataSource={formattedTransactions}
          renderItem={(item) => (
            <List.Item className="hover:bg-gray-50 rounded transition">
              <List.Item.Meta
                title={<Text strong>{item.label}</Text>}
                description={<Text type="secondary">{item.date}</Text>}
              />
              <Tag
                color={item.color === "green" ? "green" : "volcano"}
                style={{ fontWeight: "bold" }}
              >
                {item.amount}
              </Tag>
            </List.Item>
          )}
        />
      </div>

      {/* pagination */}
      <div className=" flex justify-center pt-4 pb-20 md:py-4">
        <Pagination
          defaultCurrent={1}
          position={["bottomCenter"]}
          showQuickJumper={true}
          showSizeChanger={false}
          total={data?.data?.pagination?.totalData || 0}
          current={page}
          onChange={(currentPage) => setPage(currentPage)}
          pageSize={5}
        />
      </div>
    </>
  );
}
