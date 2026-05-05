"use client";

import { Button, Form, Input, message } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { ErrorSwal, SuccessSwal } from "../../../components/utils/allSwalFire";
import { useResetPasswordMutation } from "../../../redux/features/authApi";

const ResetPassword = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem("user_token");

      const response = await resetPassword({
        token,
        body: {
          password: values.password,
          confirmPassword: values.confirmPassword,
        },
      }).unwrap();
      SuccessSwal({
        title: ``,
        text:
          response?.message ||
          response?.data?.message ||
          `Password Reset Successful!`,
      });
      localStorage.removeItem("user_token");
      router.push("/login");
    } catch (error) {
      ErrorSwal({
        title: ``,
        text: error?.message || error?.data?.message || `Something went wrong!`,
      });
    }
  };

  return (
    <div className="py-12 w-full flex flex-col justify-center items-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 focus:outline-none z-50"
          aria-label="Go Back"
        >
          <FaArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl text-primary font-semibold mt-4">
            Reset Password
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Please enter your new password!
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-6"
        >
          <Form.Item
            label={
              <span className="text-black font-semibold">New Password</span>
            }
            name="password"
            rules={[
              { required: true, message: "Please enter your new password." },
              { min: 6, message: "Password must be at least 6 characters." },
            ]}
            hasFeedback
          >
            <Input.Password
              placeholder="Enter your new password"
              size="large"
              aria-label="New Password"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-black font-semibold">Confirm Password</span>
            }
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your new password." },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match."));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password
              placeholder="Confirm your new password"
              size="large"
              aria-label="Confirm New Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 transition-colors"
            >
              Reset Password
            </Button>
          </Form.Item>

          <p className="text-center">
            Remembered your password?{" "}
            <Link href="/login" className="text-primary underline">
              Log In
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
