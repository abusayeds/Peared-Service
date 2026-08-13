"use client";

import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Modal,
  Select,
  Upload,
} from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaUpload } from "react-icons/fa";
import Swal from "sweetalert2";
import payment_img from "../../assets/payment/payment_img.png";
import CatalogSelect from "../../components/utils/CatalogSelect";
import { SuccessSwal } from "../../components/utils/allSwalFire";
import { useAddProjectMutation } from "../../redux/features/projects/projectApi";

const { Option } = Select;
const { TextArea } = Input;

const AddProject = () => {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [form] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingValues, setPendingValues] = useState(null);

  const [addProject, { isLoading }] = useAddProjectMutation();

  useEffect(() => {
    const category = localStorage.getItem("selectedCategory");
    if (category) {
      form.setFields([{ name: "projectCategory", value: category }]);
    }
  }, [form]);

  // Handle Modal Close
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");

    if (!isImage) {
      message.error("Only image files (JPG, PNG, JPEG) are allowed!");
      return Upload.LIST_IGNORE;
    }

    setImage(file);
    return false;
  };

  const buildProjectFormData = (values) => {
    const formData = new FormData();
    Object.keys(values || {}).forEach((key) => {
      if (key === "image") return;
      const value = values[key];
      if (value === undefined || value === null) return;
      if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false");
        return;
      }
      if (Array.isArray(value)) {
        formData.append(key, value[0] != null ? String(value[0]) : "");
        return;
      }
      formData.append(key, String(value));
    });

    const fileFromForm =
      values?.image?.[0]?.originFileObj ||
      values?.image?.[0] ||
      null;
    const file = fileFromForm || image;
    if (file) {
      formData.append("image", file);
    }
    return formData;
  };

  // Handle form submission
  const onFinish = async (values) => {
    const fileFromForm =
      values?.image?.[0]?.originFileObj || values?.image?.[0] || image;
    if (!fileFromForm) {
      message.error("Please upload a project image.");
      return;
    }
    setPendingValues(values);
    setIsModalVisible(true);
  };

  // Handle back button click
  const handleBack = () => {
    router.back();
  };

  // Handle image upload
  const handleFileChange = ({ file }) => {
    const raw = file?.originFileObj || file;
    if (!raw?.type?.startsWith("image/")) {
      message.error("Only image files (JPG, PNG, JPEG) are allowed!");
      return;
    }

    setImage(raw);
  };

  const handlePaymentSuccess = async () => {
    try {
      if (!pendingValues) {
        message.error("Please fill the form again.");
        return;
      }
      const formData = buildProjectFormData(pendingValues);
      if (![...formData.keys()].includes("image")) {
        message.error("Please upload a project image.");
        return;
      }

      const response = await addProject(formData).unwrap();

      if (response?.statusCode === 200 || response?.success) {
        setIsModalVisible(false);
        setPendingValues(null);
        router.push("/profile/my-projects");
        SuccessSwal({
          title: "",
          text: "Project created successfully!",
        });
      }
    } catch (error) {
      const statusCode = error?.data?.statusCode || error?.status;
      const errText =
        error?.data?.message ||
        error?.data?.errorSources?.[0]?.message ||
        error?.message ||
        "Something went wrong while creating the project.";

      if (statusCode === 402 || statusCode === 510) {
        Swal.fire({
          text: errText,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#5E9A2D",
          cancelButtonColor: "#d33",
          confirmButtonText: "Go Wallet",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/profile/wallet");
          }
        });
        return;
      }

      Swal.fire({
        text: errText,
        icon: "error",
        confirmButtonColor: "#5E9A2D",
      });
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-secondary p-4">
        <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-8 relative">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 focus:outline-none z-30"
            aria-label="Go Back"
          >
            <FaArrowLeft size={24} />
          </button>
          {/* Heading and Description */}
          <div className="mb-8">
            <h2 className="text-2xl lg:text-4xl text-primary font-semibold text-center">
              Add New Project
            </h2>
            <p className="text-center text-gray-600 mt-2">
              Fill in the details below to add a new project.
            </p>
          </div>

          {/* Form */}
          <Form
            // initialValues={{ projectCategory: "hafvbhv" }}
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-6"
          >
            {/* Grid Layout: Left and Right Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side: Location and Image Details */}
              <div>
                <h3 className="text-xl text-primary font-medium mb-4">
                  Location & Image
                </h3>

                {/* Street */}
                <Form.Item
                  label={
                    <span className="text-black font-semibold">Street</span>
                  }
                  name="street"
                  rules={[
                    { required: true, message: "Please enter the street." },
                  ]}
                >
                  <Input placeholder="Enter street" />
                </Form.Item>

                {/* City */}
                <Form.Item
                  label={<span className="text-black font-semibold">City</span>}
                  name="city"
                  rules={[
                    { required: true, message: "Please enter the city." },
                  ]}
                >
                  <Input placeholder="Enter city" />
                </Form.Item>

                {/* Post Code */}
                <Form.Item
                  label={
                    <span className="text-black font-semibold">Post Code</span>
                  }
                  name="postCode"
                  rules={[
                    { required: true, message: "Please enter the post code." },
                    {
                      pattern: /^\d{5}$/,
                      message: "Please enter a valid 5 digit post code.",
                    },
                  ]}
                >
                  <Input placeholder="Enter post code" />
                </Form.Item>

                {/* Location Type Dropdown */}
                <Form.Item
                  label={
                    <span className="text-black font-semibold">
                      Location Type
                    </span>
                  }
                  name="locationType"
                  rules={[
                    {
                      required: true,
                      message: "Please select the location type.",
                    },
                  ]}
                >
                  <Select placeholder="Select location type">
                    <Option value="Home">Home</Option>
                    <Option value="Business">Business</Option>
                  </Select>
                </Form.Item>

                {/* Time Dropdown */}
                <Form.Item
                  label={<span className="text-black font-semibold">Time</span>}
                  name="time"
                  rules={[
                    { required: true, message: "Please select the time." },
                  ]}
                >
                  <Select placeholder="Select time">
                    <Option value="Urgent(1 - 2 days)">
                      Urgent(1 - 2 days)
                    </Option>
                    <Option value="Within 2 weeks">Within 2 weeks</Option>
                    <Option value="More than 2 weeks">More than 2 weeks</Option>
                    <Option value="Not sure - still planning">
                      Not sure - still planning
                    </Option>
                  </Select>
                </Form.Item>

                {/* Price Range Dropdown */}
                <Form.Item
                  label={
                    <span className="text-black font-semibold">
                      Price Range
                    </span>
                  }
                  name="priceRange"
                  rules={[
                    {
                      required: true,
                      message: "Please select the price range.",
                    },
                  ]}
                >
                  <Select placeholder="Select price range">
                    <Option value="0-100">0 - 500</Option>
                    <Option value="0-100">501 - 1,000</Option>
                    <Option value="0-1000">1,001 - 1,500</Option>
                    <Option value="1001-5000">1,501 - 2,000</Option>
                    <Option value="5001-10000">2,001 - 2,500</Option>
                    <Option value="10001+">25,01 - 3,000</Option>
                    <Option value="10001+">3,000+</Option>
                  </Select>
                </Form.Item>

                {/* Who can see this project */}
                <Form.Item
                  name="oshaCertificate"
                  valuePropName="checked"
                  // rules={[
                  //   {
                  //     validator: (_, value) =>
                  //       value
                  //         ? Promise.resolve()
                  //         : Promise.reject(
                  //             new Error(
                  //               "You must checked the background certificate"
                  //             )
                  //           ),
                  //   },
                  // ]}
                >
                  <Checkbox>Show Osha Certificate holder </Checkbox>
                </Form.Item>
                <Form.Item
                  name="backgroundCertificate"
                  valuePropName="checked"
                  // rules={[
                  //   {
                  //     validator: (_, value) =>
                  //       value
                  //         ? Promise.resolve()
                  //         : Promise.reject(
                  //             new Error(
                  //               "You must checked the background certificate"
                  //             )
                  //           ),
                  //   },
                  // ]}
                >
                  <Checkbox>Show Background Certificate holder </Checkbox>
                </Form.Item>
                {/* <Form.Item
                  label={
                    <span className="text-black font-semibold">
                      Who can see this project?
                    </span>
                  }
                  name="showProject"
                  rules={[
                    {
                      required: true,
                      message: "Please select the option.",
                    },
                  ]}
                >
                  <Select mode="multiple" placeholder="Select price range">
                    <Option value="osha">Who has Osha certificate. </Option>
                    <Option value="background">
                      Who has Background certificate.
                    </Option>
                  </Select>
                </Form.Item> */}

                {/* Image Upload */}
                <Form.Item
                  label={
                    <span className="text-black font-semibold">
                      Project Image
                    </span>
                  }
                  name="image"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e && e.fileList;
                  }}
                  rules={[
                    {
                      required: true,
                      message: "Please upload a project image.",
                    },
                  ]}
                >
                  <Upload
                    name="logo"
                    listType="picture"
                    maxCount={1}
                    showUploadList={true}
                    beforeUpload={handleBeforeUpload}
                    onChange={handleFileChange}
                  >
                    <Button icon={<FaUpload />}>Upload Image </Button>
                  </Upload>
                </Form.Item>
              </div>

              {/* Right Side: Project Details */}
              <div>
                <h3 className="text-xl text-primary font-medium mb-4">
                  Project Details
                </h3>

                {/* Add Your Project/Work */}
                <Form.Item
                  label={
                    <span className="text-black font-semibold">
                      Add Your Project
                    </span>
                  }
                  name="projectName"
                  rules={[
                    {
                      required: true,
                      message: "Please add your project or work.",
                    },
                  ]}
                >
                  <Input placeholder="Describe your project or work" />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-black font-semibold">
                      Project Category / Service
                    </span>
                  }
                  name="projectCategory"
                  rules={[
                    { required: true, message: "Please select a service category" },
                  ]}
                >
                  <CatalogSelect
                    type="service"
                    mode="single"
                    placeholder="Search or add a service category"
                  />
                </Form.Item>

                {/* Work Details Textarea */}
                <Form.Item
                  label={
                    <span className="text-black font-semibold">
                      Work Details
                    </span>
                  }
                  name="workDetails"
                  rules={[
                    { required: true, message: "Please provide work details." },
                    {
                      min: 20,
                      message: "Work details must be at least 20 characters.",
                    },
                  ]}
                >
                  <TextArea
                    placeholder="Provide detailed information about the work."
                    rows={13}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Submit Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="w-full bg-green-500 hover:bg-green-600 transition-colors"
              >
                Add Project
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Modal */}
      <Modal
        title={null}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        className="pay-now-modal"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-green-600 mb-2">
            Pay Now
          </h1>
          <p className="text-gray-600 mb-4">
            To show your post, pay first. We need $1/week to boost this post.
          </p>
          <div className="text-5xl font-bold text-gray-800 mb-4">$1</div>

          {/* Illustration */}
          <div className="mb-6">
            <Image src={payment_img} alt="payment_img" className="mx-auto" />
          </div>

          <Button
            type="primary"
            loading={isLoading}
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90"
            onClick={handlePaymentSuccess}
          >
            Pay Now
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default AddProject;
