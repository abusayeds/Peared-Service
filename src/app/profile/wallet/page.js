"use client";

import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  InputNumber,
  Modal,
  Space,
  Spin,
  Typography,
} from "antd";
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

const { Title, Text } = Typography;

export default function Wallet() {
  const { user } = useSelector((state) => state.auth);
  // console.log(user);

  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [addBalanceForm] = Form.useForm();

  const [addBalance, { isLoading: addBalanceLoading }] =
    useAddBalanceMutation();
  const [withdrawBanalce, { isLoading: withdrawBalanceLoading }] =
    useWithdrawBalanceMutation();

  const { data, isLoading } = useMyWalletQuery();
  const balance = data?.data?.amount;

  const openAddBalanceModal = () => setIsAddBalanceModalOpen(true);
  const closeAddBalanceModal = () => {
    setIsAddBalanceModalOpen(false);
    addBalanceForm.resetFields();
  };

  const handleAddBalanceFinish = async (values) => {
    const { balanceAmount } = values;

    try {
      const response = await addBalance({ amount: balanceAmount }).unwrap();
      console.log(response);
      if (response?.success) {
        window.location.href = response?.data;
      }
    } catch (error) {
      ErrorSwal({
        tiitle: "",
        text: error?.data?.message || error?.message || "Something went wrong",
      });
    }
  };
  const handleWithdrawBalanceFinish = async (values) => {
    const { balanceAmount } = values;

    try {
      const response = await withdrawBanalce({
        amount: balanceAmount,
      }).unwrap();
      // console.log(response);
      if (response?.success) {
        if (response?.data?.url) {
          window.location.href = response?.data?.url;
        } else {
          setIsAddBalanceModalOpen(false);
          SuccessSwal({
            title: "",
            text: " Withdraw request send successfully to Admin!",
          });
          // console.log("first");
        }
      }
    } catch (error) {
      ErrorSwal({
        tiitle: "",
        text: error?.data?.message || error?.message || "Something went wrong",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4">
      <div className="text-primary text-2xl text-center font-bold my-2">
        Wallet
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 justify-center items-start">
        {/* Left Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center mx-auto">
          <WalletBalance balance={balance} />

          {user?.role === "provider" ? (
            <>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                className="mb-4 w-full"
                onClick={openAddBalanceModal}
                loading={withdrawBalanceLoading}
              >
                Withdraw Balance
              </Button>
            </>
          ) : (
            <>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                className="mb-4 w-full"
                onClick={openAddBalanceModal}
                loading={addBalanceLoading}
              >
                Add Balance
              </Button>
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="">
          <RecentWalletHistory />
        </div>
      </div>

      {/* Add Balance Modal */}
      <Modal
        title="Add Balance"
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
          initialValues={{
            balanceAmount: 0,
          }}
        >
          <Form.Item
            label="Amount"
            name="balanceAmount"
            rules={[
              { required: true, message: "Please enter the amount to add" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter amount to add"
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={closeAddBalanceModal}>Cancel</Button>
              {user?.role === "user" && (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={addBalanceLoading}
                >
                  Add Balance
                </Button>
              )}

              {user?.role === "provider" && (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={withdrawBalanceLoading}
                >
                  Withdraw Balance
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
