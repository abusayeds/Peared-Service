"use client";

import {
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  Spin,
  Upload,
  message,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaUpload } from "react-icons/fa";
import {
  ErrorSwal,
  SuccessSwal,
} from "../../../../components/utils/allSwalFire";
import { getImageUrl } from "../../../../lib/getImageUrl";
import {
  useEditProjectMutation,
  useMySingleProjectByIdQuery,
} from "../../../../redux/features/projects/projectApi";

const { Option } = Select;

export default function EditProject() {
  const router = useRouter();
  const { id } = useParams();
  // console.log(id);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  const { data, isLoading: isProjectLoading } = useMySingleProjectByIdQuery(id);
  const projectData = data?.data;
  // console.log(projectData);

  const [editProject, { isLoading: isEditLoading }] = useEditProjectMutation();

  useEffect(() => {
    if (projectData) {
      form.setFieldsValue({
        projectCategory: projectData.projectCategory,
        projectName: projectData.projectName,
        street: projectData.street,
        city: projectData.city,
        postCode: projectData.postCode,
        locationType: projectData.locationType,
        time: projectData.time,
        priceRange: projectData.priceRange,
        oshaCertificate: projectData.oshaCertificate,
        backgroundCertificate: projectData.backgroundCertificate,
        workDetails: projectData.workDetails,
      });
      if (projectData.image) {
        setImageUrl(projectData.image);
      }
    }
  }, [projectData, form]);

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Only image files (JPG, PNG, JPEG) are allowed!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onFinish = async (values) => {
    const formData = new FormData();

    Object.keys(values).forEach((key) => {
      if (key !== "image") {
        formData.append(key, values[key]);
      }
    });

    // Append image if a new one was uploaded
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    } else if (imageUrl) {
      formData.append("image", imageUrl);
    }

    try {
      const response = await editProject({
        id: id,
        data: formData,
      }).unwrap();

      if (response?.statusCode === 200) {
        SuccessSwal({
          title: "",
          text:
            response?.message ||
            response?.data?.message ||
            "Project updated successfully!",
        });
        router.push("/profile/my-projects");
      }
    } catch (error) {
      ErrorSwal({
        title: "",
        text:
          error?.data?.message ||
          error?.message ||
          "Something went wrong! Please try again.",
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isProjectLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-secondary p-4 mb-20">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-8 relative">
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 focus:outline-none z-30"
          aria-label="Go Back"
        >
          <FaArrowLeft size={24} />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl lg:text-4xl text-primary font-semibold text-center">
            Edit Project
          </h2>
          {/* <p className="text-center text-gray-600 mt-2">
            Modify the details below to update your project.
          </p> */}
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl text-primary font-medium mb-4">
                Location & Image
              </h3>

              <Form.Item
                label={<span className="text-black font-semibold">Street</span>}
                name="street"
                rules={[
                  { required: true, message: "Please enter the street." },
                ]}
              >
                <Input placeholder="Enter street" />
              </Form.Item>

              <Form.Item
                label={<span className="text-black font-semibold">City</span>}
                name="city"
                rules={[{ required: true, message: "Please enter the city." }]}
              >
                <Input placeholder="Enter city" />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-black font-semibold">Post Code</span>
                }
                name="postCode"
                rules={[
                  { required: true, message: "Please enter the post code." },
                  {
                    pattern: /^\d{5}(-\d{4})?$/,
                    message: "Please enter a valid post code.",
                  },
                ]}
              >
                <Input placeholder="Enter post code" />
              </Form.Item>

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

              <Form.Item
                label={<span className="text-black font-semibold">Time</span>}
                name="time"
                rules={[{ required: true, message: "Please select the time." }]}
              >
                <Select placeholder="Select time">
                  <Option value="Urgent(1 - 2 days)">Urgent(1 - 2 days)</Option>
                  <Option value="Within 2 weeks">Within 2 weeks</Option>
                  <Option value="More than 2 weeks">More than 2 weeks</Option>
                  <Option value="Not sure - still planning">
                    Not sure - still planning
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-black font-semibold">Price Range</span>
                }
                name="priceRange"
                rules={[
                  { required: true, message: "Please select the price range." },
                ]}
              >
                <Select placeholder="Select price range">
                  <Option value="0-1000">0 - 1,000</Option>
                  <Option value="1001-5000">1,001 - 5,000</Option>
                  <Option value="5001-10000">5,001 - 10,000</Option>
                  <Option value="10001+">10,001+</Option>
                </Select>
              </Form.Item>

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
                <Select mode="multiple" placeholder="Select one option">
                  <Option value="osha">Who has Osha certificate. </Option>
                  <Option value="background">
                    Who has Background certificate.
                  </Option>
                </Select>
              </Form.Item> */}

              <Form.Item
                label={
                  <span className="text-black font-semibold">
                    Project Image
                  </span>
                }
                name="image"
              >
                <Upload
                  name="logo"
                  listType="picture-card"
                  fileList={fileList}
                  beforeUpload={handleBeforeUpload}
                  onChange={handleFileChange}
                  maxCount={1}
                >
                  {fileList.length >= 1 ? null : (
                    <div>
                      <FaUpload />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
                {imageUrl && !fileList.length && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Current Image:</p>
                    <Image
                      width={200}
                      height={200}
                      src={getImageUrl(imageUrl)}
                      alt="Current project"
                      className="mt-2 max-w-full h-auto max-h-40"
                    />
                  </div>
                )}
              </Form.Item>
            </div>

            <div>
              <h3 className="text-xl text-primary font-medium mb-4">
                Project Details
              </h3>

              <Form.Item
                label={
                  <span className="text-black font-semibold">Project Name</span>
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
                    Project Category
                  </span>
                }
                name="projectCategory"
              >
                <Input
                  readOnly
                  className="bg-gray-100 text-gray-700 font-semibold"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-black font-semibold">Work Details</span>
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

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full bg-green-500 hover:bg-green-600 transition-colors"
              loading={isEditLoading}
            >
              Update Project
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
