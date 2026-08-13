"use client";

import { Button, Checkbox, Form, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowLeft, FaHardHat, FaUser } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { ErrorSwal, SuccessSwal } from "../../../components/utils/allSwalFire";
import { useSignupMutation } from "../../../redux/features/authApi";
import { setCredentials } from "../../../redux/slices/authSlice";

const Signup = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [accountType, setAccountType] = useState(null); // "user" | "provider"

  const [signup, { isLoading }] = useSignupMutation();

  const onFinish = async (values) => {
    if (accountType === "provider") {
      router.push("/join-contractor");
      return;
    }

    try {
      const response = await signup({
        name: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: "user",
      }).unwrap();

      dispatch(
        setCredentials({
          user: response?.data?.user,
        })
      );

      SuccessSwal({
        title: "Account created successfully!",
        text: "Please log in.",
      });

      router.push("/login");
    } catch (error) {
      ErrorSwal({
        title: "Signup failed!",
        text: error?.message || error?.data?.message || `Something went wrong!`,
      });
    }
  };

  const handleBack = () => {
    if (accountType) {
      setAccountType(null);
      return;
    }
    router.back();
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-secondary pt-20 px-4 pb-10">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-xl p-8 md:p-12 relative">
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 focus:outline-none"
          aria-label="Go Back"
        >
          <FaArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-2 border-b-2 border-b-secondary">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center">
            {accountType
              ? accountType === "user"
                ? "Sign up as a client to post jobs and hire providers"
                : "Continue as a contractor to bid on projects"
              : "Choose how you want to join Peared"}
          </p>
        </div>

        {!accountType ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAccountType("user")}
              className="group rounded-2xl border-2 border-hash/40 bg-secondary/50 p-6 text-left hover:border-primary hover:bg-secondary transition focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white mb-3">
                <FaUser size={20} />
              </span>
              <p className="text-lg font-bold text-gray-900 group-hover:text-primary">
                User
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Post projects, message providers, and send offers.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setAccountType("provider")}
              className="group rounded-2xl border-2 border-hash/40 bg-white p-6 text-left hover:border-primary hover:bg-secondary/40 transition focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-white mb-3">
                <FaHardHat size={20} />
              </span>
              <p className="text-lg font-bold text-gray-900 group-hover:text-primary">
                Provider
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Browse projects, place bids, and grow your work.
              </p>
            </button>
          </div>
        ) : accountType === "provider" ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Contractor signup needs your services and profile details.
            </p>
            <Button
              type="primary"
              size="large"
              className="w-full"
              onClick={() => router.push("/join-contractor")}
            >
              Continue as Provider
            </Button>
            <button
              type="button"
              onClick={() => setAccountType(null)}
              className="w-full text-sm text-primary underline"
            >
              Choose a different option
            </button>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-2"
          >
            <Form.Item
              label={<span className="text-black font-semibold"> Name </span>}
              name="name"
              rules={[
                { required: true, message: "Please enter your name" },
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
            >
              <Input placeholder="Enter your name" size="large" />
            </Form.Item>

            <Form.Item
              label={<span className="text-black font-semibold"> Email </span>}
              name="email"
              rules={[
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
                { required: true, message: "Please enter your valid email" },
              ]}
            >
              <Input placeholder="Enter your email" size="large" />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-black font-semibold"> Password </span>
              }
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="Enter your password" size="large" />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-black font-semibold">
                  Confirm Password
                </span>
              }
              name="confirmPassword"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm your password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="agree"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("You must agree to the terms")),
                },
              ]}
            >
              <Checkbox>
                I agreed{" "}
                <Link href="/terms-of-use">
                  <span className="text-primary font-bold underline">Terms</span>
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy">
                  <span className="text-primary font-bold underline">
                    Privacy Policy
                  </span>
                </Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
                className="w-full transition-colors"
              >
                Create Account
              </Button>
            </Form.Item>

            <p className="text-center text-sm">
              <button
                type="button"
                onClick={() => setAccountType(null)}
                className="text-primary underline"
              >
                Choose a different option
              </button>
            </p>
          </Form>
        )}

        <p className="text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
