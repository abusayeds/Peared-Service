"use client";

import { Button, Form, Input, Modal, Upload, message } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";

import default_img from "../../../assets/user_img_default.png";
import { getImageUrl } from "../../../lib/getImageUrl";
import { useUpdateUserDataMutation } from "../../../redux/features/userApi";
import ChangePasswordModal from "../../modals/ChangePasswordModal";
import { ErrorSwal, SuccessSwal } from "../../utils/allSwalFire";

export default function UserProfile() {
  const { user } = useSelector((state) => state.auth);

  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [form] = Form.useForm();

  const [updateUser] = useUpdateUserDataMutation();

  useEffect(() => {
    // Check if the user has an image or if a new image is uploaded
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (user?.image) {
      // Use the image from the API response, considering the base URL

      setPreviewImage(getImageUrl(user?.image, default_img.src));
    } else {
      // Default image if no profile image exists
      setPreviewImage(default_img.src);
    }
  }, [file, user]);

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Only image files (JPG, PNG, JPEG) are allowed!");
      return Upload.LIST_IGNORE;
    }
    setFile(file);
    return false;
  };

  const handleFileChange = ({ file }) => {
    if (!file.type.startsWith("image/")) {
      message.error("Only image files (JPG, PNG, JPEG) are allowed!");
      return;
    }
    setFile(file);
  };

  const handleEditFormSubmit = async (values) => {
    const formData = new FormData();
    const updatedValues = { ...values, image: file || user?.image }; // Use the existing image if no new image is uploaded.

    Object.keys(updatedValues).forEach((key) => {
      formData.append(key, updatedValues[key]);
    });

    if (file) {
      formData.append("image", file); // Append the new image if it's uploaded
    }

    try {
      await updateUser(formData).unwrap();
      setIsEditModalOpen(false);
      SuccessSwal({
        title: "",
        text: "Profile updated successfully!",
      });
    } catch (error) {
      ErrorSwal({
        title: "",
        text: error?.message || error?.data?.message || "Something went wrong",
      });
    }
  };

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
    form.setFieldsValue({
      name: user?.name || "",
      service: user?.service || [],
      address: user?.address || "",
      city: user?.city || "",
      postalCode: user?.postalCode || "",
    });
    // Ensure preview image is set when opening the modal
    if (user?.image && !file) {
      setPreviewImage(getImageUrl(user?.image, default_img.src));
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-6">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row justify-start items-start gap-8 shadow-2xl border border-secondary rounded w-full max-w-4xl h-auto relative p-8 md:p-12">
        <button
          onClick={handleOpenEditModal}
          className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
        >
          Update
        </button>

        {/* Profile Image */}
        <Image
          src={previewImage || default_img.src}
          alt="Provider Profile Image"
          className="w-32 h-32 md:w-64 md:h-64 object-cover rounded-full"
          width={1000}
          height={1000}
        />

        {/* Profile Information */}
        <div className="flex flex-col w-full">
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-primary mb-4">{user?.email}</p>

          <form className="w-full">
            <div className="flex flex-col gap-6">
              <div className="w-full">
                <label
                  htmlFor="address"
                  className="block text-black font-semibold"
                >
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={user?.address}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  <label
                    htmlFor="city"
                    className="block text-black font-semibold"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={user?.city}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label
                    htmlFor="postalCode"
                    className="block text-black font-semibold"
                  >
                    Post Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={user?.postalCode}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Button */}
      <button
        onClick={() => setIsChangePasswordModalOpen(true)}
        className=" bg-primary text-white px-4 py-2 md:px-6 md:py-2.5 rounded hover:bg-secondary-dark transition"
      >
        Change Password
      </button>

      {/* Edit Profile Modal */}
      <Modal
        title={
          <span className="text-xl font-bold text-primary">Update Profile</span>
        }
        visible={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        centered
        destroyOnClose
        maskClosable
        closeIcon={<FaTimes size={20} />}
        width={500}
      >
        <Form
          layout="vertical"
          initialValues={user}
          onFinish={handleEditFormSubmit}
          form={form}
        >
          <Form.Item
            label={
              <span className="text-black font-semibold">Profile Image</span>
            }
            name="image"
            rules={[
              { required: true, message: "Please upload a profile image." },
            ]}
          >
            <div className="relative flex justify-center">
              <div className="relative">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Profile Preview"
                    width={100}
                    height={100}
                    className="object-cover rounded-full w-24 h-24"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full" />
                )}

                <Upload
                  name="image"
                  maxCount={1}
                  fileList={file ? [file] : []}
                  beforeUpload={handleBeforeUpload}
                  onChange={handleFileChange}
                  showUploadList={false}
                  accept="image/*"
                  className="absolute top-0 right-0"
                >
                  <div
                    className="p-2 bg-white rounded-full shadow cursor-pointer"
                    title="Change Profile Image"
                  >
                    <FaPlus />
                  </div>
                </Upload>
              </div>
            </div>
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>

          <Form.Item
            label="Street Address"
            name="address"
            rules={[
              { required: true, message: "Please enter your street address" },
            ]}
          >
            <Input placeholder="Enter your street address" />
          </Form.Item>

          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: "Please enter your city" }]}
          >
            <Input placeholder="Enter your city" />
          </Form.Item>

          <Form.Item
            label="Postal Code"
            name="postalCode"
            rules={[
              { required: true, message: "Please enter your postal code" },
              {
                pattern: /^\d{5}$/,
                message: "Postal code must be up to 5 digits",
              },
            ]}
          >
            <Input placeholder="Enter your postal code" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
}
