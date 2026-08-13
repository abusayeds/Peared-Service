"use client";

import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Select,
  Typography,
  Upload,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { ErrorSwal, SuccessSwal } from "../../../components/utils/allSwalFire";
import CatalogSelect from "../../../components/utils/CatalogSelect";
import { useJoinAsProviderMutation } from "../../../redux/features/authApi";

const { Text } = Typography;

const JoinAsContractor = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  const [certificates, setCertificates] = useState([]);
  const [backgroundCertificates, setBackgroundCertificates] = useState([]);
  const [oshaCertificates, setOshaCertificates] = useState([]);

  const [joinProvider, { isLoading }] = useJoinAsProviderMutation();

  const handleBeforeUpload = (file) => {
    if (file.type !== "application/pdf") {
      message.error("Only PDF files are allowed!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleFileChange =
    (type, setFileList) =>
    ({ fileList }) => {
      if (fileList.length > 2) {
        message.error("You can only upload a maximum of 2 PDF files.");
        fileList = fileList.slice(0, 2);
      }
      setFileList(fileList);
    };

  const onFinish = async (values) => {
    // if (
    //   !certificates.length ||
    //   !backgroundCertificates.length ||
    //   !oshaCertificates.length
    // ) {
    //   // message.error("Please upload all required certificates.");
    //   return;
    // }

    const data = {
      ...values,
      certificates,
      backgroundCertificates,
      oshaCertificates,
    };
    const formData = new FormData();

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const val = data[key];
        formData.append(key, Array.isArray(val) ? val.join(",") : val);
      }
    }

    certificates.forEach((file) =>
      formData.append("certificate", file.originFileObj)
    );
    backgroundCertificates.forEach((file) =>
      formData.append("backgroundCertificat", file.originFileObj)
    );
    oshaCertificates.forEach((file) =>
      formData.append("oshaCertificat", file.originFileObj)
    );

    try {
      const response = await joinProvider(formData).unwrap();
      SuccessSwal({
        title: "",
        text:
          response?.message ||
          response?.data?.message ||
          "Successfully joined as a contractor!",
      });
      router.push("/login");
    } catch (error) {
      ErrorSwal({
        title: "",
        text:
          error?.message || error?.data?.message || " Something went wrong! ",
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-secondary px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-xl px-8 md:px-16 py-4 md:py-8 my-20 relative">
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-900 focus:outline-none"
          aria-label="Go Back"
        >
          <FaArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-center mt-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-primary border-b-2 border-b-secondary">
            Join As Contractor
          </h2>
        </div>

        {/* Signup Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-4"
        >
          <Form.Item
            label={<span className="text-black font-semibold">Name</span>}
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your name" size="large" />
          </Form.Item>

          <Form.Item
            label={<span className="text-black font-semibold">Email</span>}
            name="email"
            rules={[
              { type: "email", message: "Please enter a valid email address" },
              { required: true, message: "Please enter your valid email" },
            ]}
          >
            <Input placeholder="Enter your email" size="large" />
          </Form.Item>

          <Form.Item
            label={<span className="text-black font-semibold">Password</span>}
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
            hasFeedback
          >
            <Input.Password placeholder="Enter your password" size="large" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-black font-semibold">Confirm Password</span>
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
            <Input.Password placeholder="Confirm your password" size="large" />
          </Form.Item>

          {/* Service Select */}
          <Form.Item
            label={<span className="text-black font-semibold">Services</span>}
            name="service"
            rules={[
              { required: true, message: "Please select at least one service" },
            ]}
          >
            <CatalogSelect
              type="service"
              mode="multiple"
              placeholder="Search or add the services you provide"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-black font-semibold">
                Education / Certificates
              </span>
            }
            name="education"
          >
            <CatalogSelect
              type="education"
              mode="multiple"
              placeholder="Search or add your education"
              className="w-full"
            />
          </Form.Item>

          {/* Osha Certificate Upload */}
          <Form.Item
            // rules={[
            //   {
            //     required: true,
            //     message: "Please upload Osha certificate.",
            //   },
            // ]}
            className="w-full [&_.ant-upload]:w-full"
            label={
              <span className="text-black font-semibold">
                Upload Osha Certificate (PDF)
              </span>
            }
            name="oshaCertificat"
            valuePropName="fileList"
            getValueFromEvent={({ fileList }) => fileList}
          >
            <Upload
              className="w-full"
              accept="application/pdf"
              maxCount={1}
              showUploadList
              onChange={handleFileChange(
                "oshaCertificates",
                setOshaCertificates
              )}
              beforeUpload={handleBeforeUpload}
            >
              <Button
                className="w-full flex justify-center items-center"
                icon={<UploadOutlined />}
                size="large"
                block
              >
                Osha certificate (PDF)
              </Button>
            </Upload>
            <Text type="secondary" className="mt-2 block">
              Maximum of 1 PDF file.
            </Text>
          </Form.Item>

          {/* Background Certificate Upload */}
          <Form.Item
            // rules={[
            //   {
            //     required: true,
            //     message: "Please upload Background certificate.",
            //   },
            // ]}
            className="w-full [&_.ant-upload]:w-full"
            label={
              <span className="text-black font-semibold">
                Upload BG Certificate (PDF)
              </span>
            }
            name="backgroundCertificat"
            valuePropName="fileList"
            getValueFromEvent={({ fileList }) => fileList}
          >
            <Upload
              className="w-full"
              accept="application/pdf"
              maxCount={1}
              showUploadList
              onChange={handleFileChange(
                "backgroundCertificates",
                setBackgroundCertificates
              )}
              beforeUpload={handleBeforeUpload}
            >
              <Button
                className="w-full flex justify-center items-center"
                icon={<UploadOutlined />}
                size="large"
                block
              >
                Background certificate (PDF)
              </Button>
            </Upload>
            <Text type="secondary" className="mt-2 block">
              Maximum of 1 PDF file.
            </Text>
          </Form.Item>

          {/* Other Document Upload */}
          <Form.Item
            label={
              <span className="text-black font-semibold">
                Upload Other Documents (PDF)
              </span>
            }
            className="w-full [&_.ant-upload]:w-full"
            name="certificate"
            valuePropName="fileList"
            getValueFromEvent={({ fileList }) => fileList}
          >
            <Upload
              className="w-full"
              accept="application/pdf"
              maxCount={2}
              showUploadList
              onChange={handleFileChange("certificates", setCertificates)}
              beforeUpload={handleBeforeUpload}
            >
              <Button
                className="w-full flex justify-center items-center"
                icon={<UploadOutlined />}
                size="large"
                block
              >
                Others Documents (PDF)
              </Button>
            </Upload>
            <Text type="secondary" className="mt-2 block">
              Maximum of 2 PDF files.
            </Text>
          </Form.Item>

          {/* I Agree Checkbox */}
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
              I agree{" "}
              <Link href="/terms-of-use">
                <span className="text-primary font-bold underline">Terms</span>
              </Link>{" "}
              &{" "}
              <Link href="/privacy-policy">
                <span className="text-primary font-bold underline">
                  Privacy Policy
                </span>
              </Link>
            </Checkbox>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              className="w-full"
            >
              Join
            </Button>
          </Form.Item>

          <p className="text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold underline">
              Login
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default JoinAsContractor;
