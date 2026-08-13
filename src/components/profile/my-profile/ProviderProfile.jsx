"use client";

import { Button, Form, Input, message, Modal, Select, Upload } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";

import default_img from "../../../assets/user_img_default.png";
import { getImageUrl } from "../../../lib/getImageUrl";
import { useUpdateUserDataMutation } from "../../../redux/features/userApi";
import ChangePasswordModal from "../../modals/ChangePasswordModal";
import CatalogSelect from "../../utils/CatalogSelect";
import { ErrorSwal, SuccessSwal } from "../../utils/allSwalFire";

export default function ProviderProfile() {
  const { user } = useSelector((state) => state.auth);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [certificate1File, setCertificate1File] = useState(null);
  const [certificate2File, setCertificate2File] = useState(null);
  const [oshaCertFile, setOshaCertFile] = useState(null);
  const [backgroundCertFile, setBackgroundCertFile] = useState(null);

  const [certificate1Url, setCertificate1Url] = useState(null);
  const [certificate2Url, setCertificate2Url] = useState(null);
  const [oshaCertUrl, setOshaCertUrl] = useState(null);
  const [backgroundCertUrl, setBackgroundCertUrl] = useState(null);

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const [form] = Form.useForm();
  const [updateUser, { isLoading }] = useUpdateUserDataMutation();

  // Set certificate URLs when user data changes
  useEffect(() => {
    if (user && user.certificate && Array.isArray(user.certificate)) {
      if (user.certificate.length > 0) {
        setCertificate1Url(getImageUrl(user.certificate[0]));
      }
      if (user.certificate.length > 1) {
        setCertificate2Url(getImageUrl(user.certificate[1]));
      }
    }
    if (user && user.oshaCertificat) {
      setOshaCertUrl(getImageUrl(user.oshaCertificat));
    }
    if (user && user.backgroundCertificat) {
      setBackgroundCertUrl(getImageUrl(user.backgroundCertificat));
    }
  }, [user]);

  // Merge file preview logic: if a new file is selected, show it; otherwise, show the user image
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (user?.image) {
      // const formatted = user.image.replace(/^public/, "");
      setPreviewImage(getImageUrl(user?.image, default_img.src));
    } else {
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

  const handleBeforeUploadCertificate1 = (file) => {
    if (file.type !== "application/pdf") {
      message.error("Only PDF files are allowed for Certificate 1!");
      return Upload.LIST_IGNORE;
    }
    setCertificate1File(file);
    return false;
  };

  const handleBeforeUploadCertificate2 = (file) => {
    if (file.type !== "application/pdf") {
      message.error("Only PDF files are allowed for Certificate 2!");
      return Upload.LIST_IGNORE;
    }
    setCertificate2File(file);
    return false;
  };

  const handleBeforeUploadOshaCert = (file) => {
    if (file.type !== "application/pdf") {
      message.error("Only PDF files are allowed for OSHA Certificate!");
      return Upload.LIST_IGNORE;
    }
    setOshaCertFile(file);
    return false;
  };

  const handleBeforeUploadBackgroundCert = (file) => {
    if (file.type !== "application/pdf") {
      message.error("Only PDF files are allowed for Background Certificate!");
      return Upload.LIST_IGNORE;
    }
    setBackgroundCertFile(file);
    return false;
  };

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
    form.setFieldsValue({
      name: user?.name || "",
      service: user?.service || [],
      education: user?.education || [],
      bio: user?.bio || "",
      address: user?.address || "",
      city: user?.city || "",
      postalCode: user?.postalCode || "",
    });
    // Ensure preview image is set when opening the modal
    if (user?.image && !file) {
      // const formatted = user.image.replace(/^public/, "");
      setPreviewImage(getImageUrl(user?.image, default_img.src));
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setFile(null);
    setCertificate1File(null);
    setCertificate2File(null);
    setOshaCertFile(null);
    setBackgroundCertFile(null);
    form.resetFields();
  };

  const handleEditFormSubmit = async (values) => {
    const formData = new FormData();

    Object.keys(values).forEach((key) => {
      formData.append(
        key,
        Array.isArray(values[key]) ? values[key].join(",") : values[key]
      );
    });

    if (file) {
      formData.append("image", file);
    }
    // Append new certificate files (both use the same field name so backend receives an array)
    if (certificate1File) {
      formData.append("certificate", certificate1File);
    }
    if (certificate2File) {
      formData.append("certificate", certificate2File);
    }
    if (oshaCertFile) {
      formData.append("oshaCertificat", oshaCertFile);
    }
    if (backgroundCertFile) {
      formData.append("backgroundCertificat", backgroundCertFile);
    }

    try {
      await updateUser(formData).unwrap();
      SuccessSwal({
        title: "",
        text: "Profile updated successfully!",
      });
      handleCloseModal();
    } catch (error) {
      ErrorSwal({
        title: "",
        text: error?.message || error?.data?.message || "Something went wrong",
      });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-6">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row justify-start items-start gap-8 shadow-2xl border border-secondary rounded w-full max-w-4xl p-12 relative ">
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
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-black font-semibold">
                  Services
                </label>
                <input
                  type="text"
                  value={user?.service ? user.service.join(", ") : ""}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-black font-semibold">
                  Education
                </label>
                <input
                  type="text"
                  value={user?.education?.length ? user.education.join(", ") : ""}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
              {user?.bio ? (
                <div>
                  <label className="block text-black font-semibold">About</label>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{user.bio}</p>
                </div>
              ) : null}
              {/* Certificates Upload */}
              <div className="">
                {/* Display OSHA and Background Certificates beside each other */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="w-full">
                    {oshaCertUrl ? (
                      <Link
                        href={oshaCertUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 font-semibold mb-2"
                      >
                        View OSHA Certificate
                      </Link>
                    ) : (
                      <p className="text-gray-500">
                        No OSHA certificate uploaded
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    {backgroundCertUrl ? (
                      <Link
                        href={backgroundCertUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 font-semibold"
                      >
                        View Background Certificate
                      </Link>
                    ) : (
                      <p className="text-gray-500">
                        No Background certificate uploaded
                      </p>
                    )}
                  </div>
                </div>

                {/* Display Certificate 1 and Certificate 2 below the previous ones */}
                <div className="flex flex-col lg:flex-row gap-4 mt-4">
                  <div className="w-full">
                    {certificate1Url ? (
                      <Link
                        href={certificate1Url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 font-semibold"
                      >
                        View Certificate One
                      </Link>
                    ) : (
                      <p className="text-gray-500">
                        No Certificate One uploaded
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    {certificate2Url ? (
                      <Link
                        href={certificate2Url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 font-semibold"
                      >
                        View Certificate Two
                      </Link>
                    ) : (
                      <p className="text-gray-500">
                        No Certificate Two uploaded
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-black font-semibold">
                  Street Address
                </label>
                <input
                  type="text"
                  value={user?.address || ""}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  <label className="block text-black font-semibold">City</label>
                  <input
                    type="text"
                    value={user?.city || ""}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-black font-semibold">
                    Post Code
                  </label>
                  <input
                    type="text"
                    value={user?.postalCode || ""}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title="Update Profile"
        visible={isEditModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        centered
        destroyOnClose
        maskClosable
        closeIcon={<FaTimes size={20} />}
        width={500}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleEditFormSubmit}
          className="space-y-4"
          initialValues={user}
        >
          {/* Profile Image Upload */}
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
                  className="absolute top-8 right-8"
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

          {/* Name */}
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>

          {/* Service Category (search + create) */}
          <Form.Item
            label="Your Services"
            name="service"
            rules={[{ required: true, message: "Please select your service" }]}
          >
            <CatalogSelect
              type="service"
              mode="multiple"
              placeholder="Search or add services you offer"
            />
          </Form.Item>

          <Form.Item label="Education / Certificates" name="education">
            <CatalogSelect
              type="education"
              mode="multiple"
              placeholder="Search or add your education"
            />
          </Form.Item>

          <Form.Item label="About / Bio" name="bio">
            <Input.TextArea
              rows={3}
              placeholder="Tell clients about your experience…"
              maxLength={600}
              showCount
            />
          </Form.Item>

          {/* Certificates Upload */}
          <div className="grid md:grid-cols-2 gap-4">
            <Form.Item
              className="w-full [&_.ant-upload]:w-full"
              label="Upload OSHA Certificate"
              name="oshaCertificat"
            >
              <Upload
                className="w-full"
                maxCount={1}
                accept="application/pdf"
                beforeUpload={handleBeforeUploadOshaCert}
                fileList={
                  oshaCertFile ? [{ uid: "-1", name: oshaCertFile.name }] : []
                }
                onRemove={() => setOshaCertFile(null)}
              >
                <Button
                  className="w-full flex justify-center items-center"
                  icon={<FaPlus />}
                >
                  OSHA Certificate
                </Button>
              </Upload>
            </Form.Item>
            <Form.Item
              className="w-full [&_.ant-upload]:w-full"
              label="Upload BG Certificate"
              name="backgroundCertificat"
            >
              <Upload
                className="w-full"
                maxCount={1}
                accept="application/pdf"
                beforeUpload={handleBeforeUploadBackgroundCert}
                fileList={
                  backgroundCertFile
                    ? [{ uid: "-2", name: backgroundCertFile.name }]
                    : []
                }
                onRemove={() => setBackgroundCertFile(null)}
              >
                <Button
                  className="w-full flex justify-center items-center"
                  icon={<FaPlus />}
                >
                  Background Certificate
                </Button>
              </Upload>
            </Form.Item>
          </div>

          <div className="grid md:grid-cols-2 gap-4 ">
            <Form.Item
              className="w-full [&_.ant-upload]:w-full"
              label="Upload Certificate One"
              name="certificate1"
            >
              <Upload
                className="w-full"
                maxCount={1}
                accept="application/pdf"
                beforeUpload={handleBeforeUploadCertificate1}
                fileList={
                  certificate1File
                    ? [{ uid: "-3", name: certificate1File.name }]
                    : []
                }
                onRemove={() => setCertificate1File(null)}
              >
                <Button
                  className="w-full flex justify-center items-center"
                  icon={<FaPlus />}
                >
                  Certificate One
                </Button>
              </Upload>
            </Form.Item>
            <Form.Item
              className="w-full [&_.ant-upload]:w-full"
              label="Upload Certificate Two"
              name="certificate2"
            >
              <Upload
                className="w-full"
                maxCount={1}
                accept="application/pdf"
                beforeUpload={handleBeforeUploadCertificate2}
                fileList={
                  certificate2File
                    ? [{ uid: "-4", name: certificate2File.name }]
                    : []
                }
                onRemove={() => setCertificate2File(null)}
              >
                <Button
                  className="w-full flex justify-center items-center"
                  icon={<FaPlus />}
                >
                  Certificate Two
                </Button>
              </Upload>
            </Form.Item>
          </div>

          {/* Street Address */}
          <Form.Item
            label="Street Address"
            name="address"
            rules={[{ required: true, message: "Please enter your address" }]}
          >
            <Input placeholder="Street address" />
          </Form.Item>

          {/* City & Postal Code in one row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="City"
              name="city"
              rules={[{ required: true, message: "Please enter your city" }]}
            >
              <Input placeholder="City" />
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
              <Input placeholder="Postal code" />
            </Form.Item>
          </div>

          {/* Other Form Items */}
          <Form.Item>
            <Button
              type="primary"
              loading={isLoading}
              htmlType="submit"
              className="w-full"
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {/* Change Password Button */}
      <button
        onClick={() => setIsChangePasswordModalOpen(true)}
        className=" bg-primary text-white px-4 py-2 md:px-6 md:py-2.5 rounded hover:bg-secondary-dark transition"
      >
        Change Password
      </button>

      {/* Change Password Modal */}
      <div className="mb-20">
        <ChangePasswordModal
          visible={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      </div>
    </div>
  );
}
