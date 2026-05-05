"use client";

import { Button, Form, Input } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { ErrorSwal, SuccessSwal } from "../../../components/utils/allSwalFire";
import {
  useResendOtpMutation,
  useVerifyForgetOtpMutation,
} from "../../../redux/features/authApi";

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(180);

  const [verifyForgetOtp, { isLoading }] = useVerifyForgetOtpMutation();
  const [resendOtp, { isLoading: resendLoading }] = useResendOtpMutation();

  // Load timer from session storage on component mount
  useEffect(() => {
    const storedExpireTime = sessionStorage.getItem("resendExpireTime");
    if (storedExpireTime) {
      const timeRemaining = Math.floor(
        (parseInt(storedExpireTime) - Date.now()) / 1000
      );
      if (timeRemaining > 0) {
        setResendTimer(timeRemaining);
        setResendDisabled(true);
      } else {
        sessionStorage.removeItem("resendExpireTime");
      }
    }

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          sessionStorage.removeItem("resendExpireTime");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle OTP input change (supports copy-pasting full OTP)
  const onChangeOtp = (index, value) => {
    if (/^\d{0,6}$/.test(value)) {
      const newOtp = [...otp];

      if (value.length === 6) {
        // If pasting all 6 digits at once
        setOtp(value.split(""));
        inputRefs.current[5]?.focus();
      } else {
        // Normal input handling
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    }
  };

  // Handle backspace key navigation
  const onKeyDownOtp = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification
  const onFinish = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      ErrorSwal({
        title: "",
        text: "Please enter the complete 6-digit OTP.",
      });
      return;
    }

    try {
      const response = await verifyForgetOtp({
        otp: enteredOtp,
      }).unwrap();

      if (response.success) {
        SuccessSwal({
          title: "",
          text: response?.message || "Something went wrong!",
        });

        localStorage.setItem("user_token", response?.data?.token);
        router.push(`/reset-password`);
      } else {
        ErrorSwal({
          title: "",
          text: response.message || "Invalid OTP. Please try again.",
        });

        // message.error();
      }
    } catch (error) {
      ErrorSwal({
        title: "",
        text: error?.message || error.data.message || " Something went wrong! ",
      });
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendDisabled) return;
    if (!email) {
      ErrorSwal({
        title: "",
        text: " Email not found. Please go back and re-enter your email! ",
      });
      return;
    }

    try {
      const response = await resendOtp(email).unwrap();
      SuccessSwal({
        title: "",
        text: response?.message || " Something went wrong! ",
      });

      // Set timer in session storage
      const expireTime = Date.now() + 180 * 1000;
      sessionStorage.setItem("resendExpireTime", expireTime.toString());
      setResendDisabled(true);
      setResendTimer(180);
    } catch (error) {
      ErrorSwal({
        title: "",
        text:
          error?.data?.message || error?.message || " Something went wrong! ",
      });
    }
  };

  // Handle Go Back
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="py-12 w-full flex flex-col justify-center items-center bg-gray-100 p-4 ">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 focus:outline-none z-50"
          aria-label="Go Back"
        >
          <FaArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl text-primary font-semibold mt-4">
            Verify Your Email
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Please enter the 6-digit OTP sent to your email.
          </p>
        </div>

        <Form layout="vertical" onFinish={onFinish} className="space-y-6">
          <div className="flex justify-between space-x-4">
            {otp.map((digit, index) => (
              <Form.Item key={index} className="mb-0">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => onChangeOtp(index, e.target.value)}
                  onKeyDown={(e) => onKeyDownOtp(index, e)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="text-center w-14 h-14 text-2xl border-gray-300 rounded-md focus:border-green-500 focus:ring-green-500"
                  aria-label={`OTP Digit ${index + 1}`}
                />
              </Form.Item>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Didn’t receive the code?</span>
            <Button
              type="link"
              onClick={handleResendOtp}
              disabled={resendDisabled || resendLoading}
              className="text-green-500 hover:text-green-600"
            >
              {resendDisabled ? (
                <span className="text-red-500">
                  Resend OTP in {resendTimer}s
                </span>
              ) : (
                "Resend"
              )}
            </Button>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 transition-colors"
            >
              Verify
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default VerifyEmail;
