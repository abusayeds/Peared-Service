"use client";

import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Pagination,
  Select,
  Spin,
  Typography,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import BottomBar from "../../components/BottomBar/BottomBar";
import { ErrorSwal, SuccessSwal } from "../../components/utils/allSwalFire";
import {
  useAllProjectsQuery,
  useCreateBidProjectMutation,
} from "../../redux/features/projects/projectApi";

const { Text } = Typography;
const { Option } = Select;
const { Search, TextArea } = Input;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

// const categories = [
//   { _id: "1", name: "Residential Cleaning" },
//   { _id: "2", name: "Commercial Cleaning" },
//   { _id: "3", name: "Painting" },
//   { _id: "4", name: "Landscaping" },
//   { _id: "5", name: "Carpentry" },
// ];

export default function Projects() {
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchText, setSearchText] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [page, setPage] = useState(1);

  const router = useRouter();

  const { data, isLoading } = useAllProjectsQuery({
    page,
    searchTerm: searchText,
  });

  const [bidProject] = useCreateBidProjectMutation();
  // console.log(data.data.project);

  useEffect(() => {
    if (isModalOpen || isBidModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen, isBidModalOpen]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        handleCloseModal();
        handleCloseBidModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleClickProjectDetails = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    setIsImageLoaded(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleOpenBidModal = (project) => {
    setSelectedProject(project);
    setIsBidModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCloseBidModal = () => {
    setIsBidModalOpen(false);
  };

  const handlePayNow = () => {
    message.success("Payment successful! Redirecting...");
    window.location.href = paymentUrl;
    // router.push("/login");
  };

  // const filteredProjects = data?.data?.project?.filter((proj) => {
  //   if (selectedCategory && proj.projectCategory !== selectedCategory) {
  //     return false;
  //   }
  //   if (
  //     searchText &&
  //     !proj.projectName.toLowerCase().includes(searchText.toLowerCase())
  //   ) {
  //     return false;
  //   }
  //   return true;
  // });

  const handleSelectCategory = (value) => {
    setSelectedCategory(value);
  };

  const handleSearch = (value) => {
    console.log(value);
    setSearchText(value);
  };

  // const handleClearFilters = () => {
  //   setSelectedCategory("");
  //   setSearchText("");
  // };

  const handleBeforeUpload = (file) => {
    if (file.type !== "application/pdf") {
      message.error("Only PDF files are allowed!");
      return Upload.LIST_IGNORE;
    }

    let newFileList = [...certificates, file];
    if (newFileList.length > 10) {
      message.error("You can only upload a maximum of 10 PDF files.");
      return Upload.LIST_IGNORE;
    }
    setCertificates(newFileList);

    return true;
  };

  const handleFileChange = ({ fileList }) => {
    console.log("Updated File List:", fileList);

    if (fileList.length > 10) {
      message.error("You can only upload a maximum of 2 PDF files.");
      fileList = fileList.slice(0, 10);
    }

    setCertificates(fileList);
  };

  const onFinish = async (values) => {
    const projectId = selectedProject?._id;
    // if (!certificates || certificates.length === 0) {
    //   message.error("Please upload at least one certificate.");
    //   return;
    // }

    const estimatedServiceTime = values.estimatedServiceTime || false;

    const data = {
      ...values,
      certificates: certificates,
      projectId,
      estimatedServiceTime,
    };
    const formData = new FormData();
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        formData.append(key, data[key]);
      }
    }
    certificates.forEach((file, index) => {
      formData.append(`certificate`, file.originFileObj);
    });

    try {
      const response = await bidProject(formData).unwrap();
      console.log(response);

      if (response?.data?._id) {
        SuccessSwal({
          title: "",
          text:
            response?.message ||
            response?.data?.message ||
            `Bid created successfully!`,
        });
        router.push(`profile/my-bids`);
      } else {
        setPaymentUrl(response?.data);

        setIsModalVisible(true);
        // console.log("payment");
      }
    } catch (error) {
      ErrorSwal({
        title: "",
        text: error?.message || error?.data?.message || `Something went wrong!`,
      });
    }

    setIsBidModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <section className=" bg-white">
        <div className="text-primary text-2xl text-center font-bold mt-2">
          Projects List
        </div>
        <div className="container mx-auto px-4">
          {/* <div className="mb-8 text-center">
            <CustomHeading>Projects List </CustomHeading>
          </div> */}

          <div className="flex items-center justify-center gap-4 my-8">
            {/* <Select
              placeholder="Select Category"
              style={{ width: 200 }}
              value={selectedCategory || undefined}
              onChange={handleSelectCategory}
              allowClear
            >
              {categories?.map((cat) => (
                <Option key={cat._id} value={cat.name}>
                  {cat.name}
                </Option>
              ))}
            </Select> */}

            <Search
              placeholder="Search by project name"
              allowClear
              onSearch={handleSearch}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            {/* <Button onClick={handleClearFilters}>Clear All</Button> */}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.data?.project?.length === 0 ? (
              <p className="text-red-500 min-h-screen text-center text-2xl font-semibold w-full mx-auto">
                {" "}
                No project found!
              </p>
            ) : (
              <>
                {data?.data?.project?.map((project) => (
                  <div
                    key={project._id}
                    className="bg-secondary p-4 rounded-lg overflow-hidden shadow-md flex flex-col hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative w-full h-48 mb-4 rounded-t-lg overflow-hidden">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${project?.image}`}
                        alt={project.projectName}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-semibold mb-2">
                        {project.projectCategory}
                      </h3>
                      <p className=" mb-1 text-primary font-semibold">
                        <span className="font-bold text-black">Price:</span> $
                        {project.priceRange}
                      </p>
                      <p className=" mb-4 text-primary font-semibold">
                        <span className="font-bold text-black">Time:</span>{" "}
                        {project.time}
                      </p>
                      <p className=" mb-1 text-primary font-semibold">
                        <span className="font-bold text-black">City:</span>{" "}
                        {project.city}
                      </p>
                      <p className=" mb-1 text-primary font-semibold">
                        <span className="font-bold text-black">Post Code:</span>{" "}
                        {project.postCode}
                      </p>
                      <p className=" mb-1 text-primary font-semibold">
                        <span className="font-bold text-black">Street:</span>{" "}
                        {project.street}
                      </p>
                      <p className=" mb-4 text-primary font-semibold">
                        <span className="font-bold text-black">
                          Location Type:
                        </span>{" "}
                        {project.locationType}
                      </p>

                      <div className="flex justify-between">
                        <button
                          onClick={() => handleClickProjectDetails(project)}
                          className="bg-primary/80 text-white px-4 py-2 rounded hover:bg-primary transition-colors duration-300"
                        >
                          Learn More
                        </button>
                        {user?.role === "provider" && (
                          <button
                            onClick={() => handleOpenBidModal(project)}
                            className="bg-primary/80 text-white px-4 py-2 rounded hover:bg-primary transition-colors duration-300"
                          >
                            Bid
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && selectedProject && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-white border-2 border-primary rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 relative overflow-auto max-h-full"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors duration-200"
                aria-label="Close Modal"
              >
                <FaTimes size={24} />
              </button>
              <div className="p-6">
                <h2
                  id="modal-title"
                  className="text-2xl font-semibold mb-6 text-center text-primary"
                >
                  Project Details
                </h2>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <ul className="space-y-2">
                      <li className="font-bold text-xl">
                        {selectedProject.projectName}
                      </li>
                      <li className="text-primary font-semibold">
                        <span className="font-bold text-black  ">
                          Category:
                        </span>{" "}
                        {selectedProject.projectCategory}
                      </li>
                      <li className="text-primary font-semibold">
                        <span className="font-bold text-black  ">
                          Price Range:
                        </span>{" "}
                        ${selectedProject.priceRange}
                      </li>
                      <li className="text-primary font-semibold">
                        <span className="font-bold text-black  ">Time:</span>{" "}
                        {selectedProject.time}
                      </li>

                      <li className="text-primary font-semibold">
                        <span className="font-bold text-black  ">City:</span>{" "}
                        {selectedProject.city}
                      </li>
                      <li className="text-primary font-semibold">
                        <span className="font-bold text-black  ">
                          Post Code:
                        </span>{" "}
                        {selectedProject.postCode}
                      </li>
                      <li className="text-primary font-semibold">
                        <span className="font-bold text-black  ">Street:</span>{" "}
                        {selectedProject.street}
                      </li>
                    </ul>
                  </div>
                  <div className="md:w-1/2">
                    <div
                      className={`relative w-full h-40 mb-4 ${
                        isImageLoaded ? "block" : "hidden"
                      }`}
                    >
                      <Image
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${selectedProject?.image}`}
                        alt={selectedProject.projectName}
                        layout="fill"
                        objectFit="cover"
                        className="rounded"
                        onLoadingComplete={() => setIsImageLoaded(true)}
                      />
                    </div>
                    <p className="text-black text-xs font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                      {selectedProject.workDetails}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* providers create-bit modal */}
      <Modal
        open={isBidModalOpen}
        onCancel={handleCloseBidModal}
        footer={null}
        destroyOnHidden
        title={
          <h2 className="text-xl font-bold text-primary">Bid this project</h2>
        }
      >
        <Form layout="vertical" onFinish={onFinish}>
          <div>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: "Please enter a price" }]}
            >
              <InputNumber placeholder="Price" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Service Time (days)"
              name="serviceTime"
              rules={[
                { required: true, message: "Please enter the service time" },
              ]}
            >
              <InputNumber placeholder="4 days" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Starting Date"
              name="startTime"
              rules={[
                { required: true, message: "Please pick a starting date" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              label="Work Details"
              name="Workdetails"
              rules={[
                {
                  required: true,
                  message: "Please write something about your work process",
                },
              ]}
            >
              <TextArea
                rows={6}
                maxLength={200}
                placeholder="Write something about your work process"
              />
            </Form.Item>

            {/* Document Upload Field */}
            <Form.Item
              label={
                <span className="text-black font-semibold">
                  Upload Document (PDF)
                </span>
              }
              // required
              name="certificate"
              valuePropName="fileList"
              getValueFromEvent={({ fileList }) => fileList}
            >
              <Upload
                accept="application/pdf"
                maxCount={10}
                showUploadList
                className="w-full"
                beforeUpload={handleBeforeUpload}
                onChange={handleFileChange}
              >
                <Button
                  htmlType="button"
                  icon={<UploadOutlined />}
                  size="large"
                  block
                >
                  Upload Document (PDF)
                </Button>
              </Upload>
              <Text type="secondary" className="mt-2 block">
                Upload your certificates or documents related to the project.
              </Text>
            </Form.Item>
            {/* ------ */}
            {/*  */}
            <Form.Item
              name="estimatedServiceTime"
              valuePropName="checked"
              // rules={[
              //   {
              //     validator: (_, value) =>
              //       value
              //         ? Promise.resolve()
              //         : Promise.reject(
              //             new Error("You must agree to the terms")
              //           ),
              //   },
              // ]}
            >
              <Checkbox className="text-base font-medium">
                estimated service time{" "}
              </Checkbox>
            </Form.Item>

            {/*  */}
          </div>
          <div className="text-center flex justify-center gap-8">
            <Button onClick={handleCloseBidModal}>Back</Button>
            <Button type="primary" htmlType="submit">
              Bid this project
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        closable
        centered
      >
        {/* Modal content matching your design */}
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold mb-2 text-green-700">Pay Now</h2>
          <p className="mb-6">
            Doing some activity you must pay $30 for the first time.{" "}
          </p>

          {/* Big price text */}
          <div className="text-4xl font-bold text-gray-700 mb-4">$30</div>

          {/* Optionally place an image or icon here */}
          {/* <img src="/some-money-illustration.png" alt="Payment" className="mx-auto mb-6" /> */}

          {/* Payment button */}
          <Button
            type="primary"
            size="large"
            className="bg-green-500 hover:bg-green-600 border-none"
            onClick={handlePayNow}
            block
          >
            Pay Now
          </Button>
        </div>
      </Modal>

      <div className=" flex justify-center pt-4 pb-20 md:p-4">
        <Pagination
          defaultCurrent={1}
          position={["bottomCenter"]}
          showQuickJumper={true}
          showSizeChanger={false}
          total={data?.data?.pagination?.totalData || 0}
          current={page}
          onChange={(currentPage) => setPage(currentPage)}
          pageSize={10}
        />
      </div>

      <BottomBar />
    </>
  );
}
