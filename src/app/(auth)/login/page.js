"use client";

import { Button, Checkbox, Form, Input } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { ErrorSwal, SuccessSwal } from "../../../components/utils/allSwalFire";
import { useLoginMutation } from "../../../redux/features/authApi";
import { setCredentials } from "../../../redux/slices/authSlice";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const redirectPath = searchParams.get("from") || "/";

  const [login, { isLoading }] = useLoginMutation();

  const onFinish = async (values) => {
    try {
      const response = await login({
        email: values.email,
        password: values.password,
      }).unwrap();
      localStorage.setItem("user_token", response?.data?.token);
      document.cookie = `authToken=${response?.data?.token}; path=/; max-age=${
        60 * 60 * 24 * 7
      }`;

      dispatch(
        setCredentials({
          user: response?.data?.user,
          token: response?.data?.token,
        })
      );

      SuccessSwal({
        title: "Login successful!",
        text: "Welcome to Peared!",
      });

      router.push(redirectPath);
    } catch (error) {
      console.log(error);
      ErrorSwal({
        title: "Login failed!",
        text: error?.data?.message || error?.message || "Something went wrong!",
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-secondary px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-xl p-8 md:p-16 mt-[-200px] relative">
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-900 focus:outline-none"
          aria-label="Go Back"
        >
          <FaArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-2xl md:text-4xl font-semibold text-primary mb-8 border-b-2 border-b-secondary">
            Login
          </h2>
        </div>

        {/* Login Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-0"
        >
          <div className="grid grid-cols-1">
            {/* Email Field */}
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

            {/* Password Field */}
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
          </div>
          {/* Remember Me and Forgot Password */}
          <div className="flex justify-between items-center">
            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>
                <span className="text-black font-bold">Remember me</span>
              </Checkbox>
            </Form.Item>
            <Form.Item>
              <Link
                href="/forgot-password"
                className="text-primary font-bold underline"
              >
                Forget password?
              </Link>
            </Form.Item>
          </div>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              className="w-full hover:bg-primary transition-colors"
            >
              Login
            </Button>
          </Form.Item>

          {/* Navigation Link to Signup Page */}
          <p className="text-center pt-4">
            {"Don't have an account?"}{" "}
            <Link href="/signup" className="text-primary font-bold underline">
              Create Account
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Login;
