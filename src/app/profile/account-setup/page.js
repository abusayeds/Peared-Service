"use client";

import { Button, Divider, Spin } from "antd";
import Link from "next/link";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useGetUserDataQuery } from "../../../redux/features/userApi";

export default function AccountSetup() {
  const { data, isLoading } = useGetUserDataQuery();
  const userData = data?.data;

  // Define the steps and their conditions
  const steps = [
    {
      title: "Log In to the Mobile App",
      condition: userData?.email != null, // Check if email exists
    },
    {
      title: "Agree to Terms & Conditions",
      condition: userData?.isApproved === true, // Check if approved
    },
    {
      title: "Background Check",
      condition: userData?.verifiedSkillset === true, // Check if skillset is verified
    },
    {
      title: "Set Up a Payout Account",
      condition: userData?.accountId, // Check if accountId is set
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold text-center text-primary mb-6">
        Account Setup
      </h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-md ${
              step.condition ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {/* Conditionally render the tick or cross icon */}
              {step.condition ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaTimes className="text-red-500" />
              )}
              <span
                className={`text-lg font-semibold ${
                  step.condition ? "text-green-700" : "text-red-700"
                }`}
              >
                {step.title}
              </span>
            </div>
            <span
              className={`text-sm font-medium ${
                step.condition ? "text-green-600" : "text-red-600"
              }`}
            >
              {step.condition ? "Complete" : "Incomplete"}
            </span>
          </div>
        ))}
      </div>
      <Divider />
      {/* Use Link component for navigation */}
      <Link href="/profile/wallet">
        <Button type="primary" size="large" className="w-full">
          Continue
        </Button>
      </Link>
    </div>
  );
}
