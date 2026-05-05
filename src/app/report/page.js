"use client";

import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Upload, message } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

import Swal from "sweetalert2";
import report_img from "../../assets/payment/report_img.png";
import { ErrorSwal, SuccessSwal } from "../../components/utils/allSwalFire";
import { useReportProviderMutation } from "../../redux/features/feedback/feedbackApi";

const { TextArea } = Input;

export default function Report(props) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [reportProvider, { isLoading }] = useReportProviderMutation();

  const { userId, bidProjectId } = props.searchParams;
  console.log(userId);
  console.log(bidProjectId);

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Only image files (JPG, PNG, JPEG) are allowed!");
      return Upload.LIST_IGNORE;
    }
    setImage(file);
    return false;
  };

  const onFinish = (values) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (key !== "image") {
        formData.append(key, values[key]);
      }
    });
    if (values.image && values.image.length > 0) {
      formData.append("image", values.image[0].originFileObj);
    }
    formData.append("userId", userId);
    formData.append("bitProjectId", bidProjectId);

    setPendingData(formData);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFileChange = ({ file }) => {
    if (!file.type.startsWith("image/")) {
      message.error("Only image files (JPG, PNG, JPEG) are allowed!");
      return;
    }
    setImage(file);
  };

  const handlePaymentSuccess = async () => {
    try {
      console.log(pendingData);
      const response = await reportProvider(pendingData).unwrap();
      console.log(response);

      console.log(response);
      if (response?.statusCode === 200) {
        setIsModalVisible(false);
        router.push("/");
        SuccessSwal({
          title: "",
          text: "Report submitted successfully!",
        });
        form.resetFields("");
      }
    } catch (error) {
      const statusCode = error?.data?.statusCode;
      if (statusCode === 510) {
        Swal.fire({
          text:
            error?.message || error?.data?.message || "something went wrong",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Go Wallet",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/profile/wallet");
          }
        });
      } else {
        ErrorSwal({
          title: "",
          text:
            error?.message || error?.data?.message || "Something went wrong!",
        });
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-secondary p-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-8 relative">
        <button
          onClick={() => router.back()}
          className="absolute top-8 left-8 text-gray-600 hover:text-gray-800 focus:outline-none z-30"
          aria-label="Go Back"
        >
          <FaArrowLeft size={24} />
        </button>
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-semibold">Report</h2>
          <p className="text-gray-600 mt-1">Provide your report below.</p>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-5"
        >
          <Form.Item
            label="Your Feedback"
            name="details"
            rules={[
              { required: true, message: "Please enter your feedback." },
              { min: 10, message: "At least 10 characters." },
            ]}
          >
            <TextArea rows={4} placeholder="Describe your feedback or report" />
          </Form.Item>
          <Form.Item
            label="Upload Screenshot / Images (optional)"
            name="image"
            rules={[{ required: true, message: "Please upload your image!" }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload
              name="image"
              listType="picture"
              multiple
              beforeUpload={handleBeforeUpload}
              onChange={handleFileChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Images</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-green-500 hover:bg-green-600 border-none"
              loading={isLoading}
            >
              Submit Report
            </Button>
          </Form.Item>
        </Form>
      </div>
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-green-600 mb-2">
            Pay Now
          </h1>
          <p className="text-gray-600 mb-4">
            Please pay $25 to confirm your report submission.
          </p>
          <div className="text-4xl font-bold text-gray-800 mb-4">$25</div>
          <div className="mb-6">
            <Image src={report_img} alt="Payment" className="mx-auto" />
          </div>
          <Button
            type="primary"
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90"
            onClick={handlePaymentSuccess}
            loading={isLoading}
          >
            Pay Now
          </Button>
        </div>
      </Modal>
    </div>
  );
}
