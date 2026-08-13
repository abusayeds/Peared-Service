"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, InputNumber, Modal, Space, Spin } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import RecentWalletHistory from "../../../components/profile/wallet/RecentWalletHistory";
import WalletBalance from "../../../components/profile/wallet/WalletBalance";
import { ErrorSwal, SuccessSwal } from "../../../components/utils/allSwalFire";
import {
  useAddBalanceMutation,
  useMyWalletQuery,
  useWithdrawBalanceMutation,
} from "../../../redux/features/payment/paymentApi";

export default function Wallet() {
  const { user } = useSelector((state) => state.auth);
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [addBalanceForm] = Form.useForm();

  const [addBalance, { isLoading: addBalanceLoading }] = useAddBalanceMutation();
  const [withdrawBanalce, { isLoading: withdrawBalanceLoading }] =
    useWithdrawBalanceMutation();

  const { data, isLoading } = useMyWalletQuery();
  const balance = data?.data?.amount;

  const closeAddBalanceModal = () => {
    setIsAddBalanceModalOpen(false);
    addBalanceForm.resetFields();
  };

  const handleAddBalanceFinish = async (values) => {
    try {
      const response = await addBalance({ amount: values.balanceAmount }).unwrap();
      if (response?.success) {
        window.location.href = response?.data;
      }
    } catch (error) {
      ErrorSwal({
        title: "",
        text: error?.data?.message || error?.message || "Something went wrong",
      });
    }
  };

  const handleWithdrawBalanceFinish = async (values) => {
    try {
      const response = await withdrawBanalce({
        amount: values.balanceAmount,
      }).unwrap();
      if (response?.success) {
        if (response?.data?.url) {
          window.location.href = response?.data?.url;
        } else {
          setIsAddBalanceModalOpen(false);
          SuccessSwal({
            title: "",
            text: "Withdraw request send successfully to Admin!",
          });
        }
      }
    } catch (error) {
      ErrorSwal({
        title: "",
        text: error?.data?.message || error?.message || "Something went wrong",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-secondary/70 to-white px-4 py-4 pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-5 text-center sm:text-left">
          <p className="text-[11px] uppercase tracking-wider text-hash">Payments</p>
          <h1 className="text-2xl font-bold text-primary">My Wallet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage balance and review recent activity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="bg-white border border-hash/25 rounded-2xl shadow-sm p-5 flex flex-col items-center">
            <WalletBalance balance={balance} />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              className="mt-5 w-full max-w-md !bg-primary hover:!bg-[#4d7f24]"
              onClick={() => setIsAddBalanceModalOpen(true)}
              loading={
                user?.role === "provider"
                  ? withdrawBalanceLoading
                  : addBalanceLoading
              }
            >
              {user?.role === "provider" ? "Withdraw Balance" : "Add Balance"}
            </Button>
          </div>

          <RecentWalletHistory />
        </div>
      </div>

      <Modal
        title={user?.role === "provider" ? "Withdraw Balance" : "Add Balance"}
        open={isAddBalanceModalOpen}
        onCancel={closeAddBalanceModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={addBalanceForm}
          layout="vertical"
          onFinish={
            user?.role === "provider"
              ? handleWithdrawBalanceFinish
              : handleAddBalanceFinish
          }
          initialValues={{ balanceAmount: 0 }}
        >
          <Form.Item
            label="Amount"
            name="balanceAmount"
            rules={[{ required: true, message: "Please enter the amount" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="Enter amount"
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={closeAddBalanceModal}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                className="!bg-primary"
                loading={
                  user?.role === "provider"
                    ? withdrawBalanceLoading
                    : addBalanceLoading
                }
              >
                {user?.role === "provider" ? "Withdraw" : "Add Balance"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
