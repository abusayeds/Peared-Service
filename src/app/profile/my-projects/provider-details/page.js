"use client";

import { Button, Modal, Rate } from "antd";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaStar } from "react-icons/fa";
import TopReviews from "../../../../components/reviews/TopReviews";
import { SuccessSwal } from "../../../../components/utils/allSwalFire";
import { useMyProjectBitDetailsQuery } from "../../../../redux/features/projects/projectApi";

export default function ProviderDetails(props) {
  const { bitProjectId } = props.searchParams;
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data } = useMyProjectBitDetailsQuery(bitProjectId);
  const bid = data?.data;

  const formattedStartDate = bid?.startDate
    ? format(new Date(bid.startDate), "dd MMM yyyy")
    : "N/A";

  const handleBack = () => {
    router.back();
  };

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  const handleConfirm = () => {
    setIsModalVisible(false);
    SuccessSwal({
      title: "",
      text: "Service approved successfully!",
    });
    router.push(
      `/profile/my-projects/payment?approvdProjectId=${bitProjectId}`
    );
  };

  return (
    <>
      <div className="text-primary text-2xl text-center font-bold my-2">
        Provider Details
      </div>
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8 md:p-4  border border-gray-200 overflow-x-hidden">
        <div className="border rounded-lg p-4 sm:p-6 bg-gray-50 overflow-x-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start w-full">
            {/* Provider Info */}
            <div className="mb-6 w-full md:w-2/3">
              <p className="text-lg font-semibold text-gray-800">
                Provider ID: #{bid?.providerId?.slice(0, 7)}...
              </p>
              <p className="text-xl font-bold text-primary">
                {bid?.projectType}
              </p>
              <p className="text-black font-semibold">
                Provider Name:{" "}
                <span className="font-bold text-primary">
                  {" "}
                  {bid?.providerName}
                </span>{" "}
              </p>
              <p className="text-black font-semibold">
                Price:{" "}
                <span className="font-bold text-primary">${bid?.price}</span>
              </p>
              <p className="text-black font-semibold">
                Service Time:{" "}
                <span className="font-bold text-primary">
                  {bid?.serviceTime} Days
                </span>{" "}
              </p>
              <p className="text-black font-semibold">
                Starting Date:{" "}
                <span className="font-bold text-primary">
                  {formattedStartDate}
                </span>{" "}
              </p>
            </div>

            {/* Ratings Section */}
            <div className="mb-6 w-full md:w-1/3 flex flex-col justify-center items-center">
              <div className="flex items-center gap-2">
                <Rate
                  allowHalf
                  value={parseFloat(bid?.averageRating)}
                  disabled
                  className="text-yellow-500"
                />
                <span className="text-gray-700 font-bold">
                  ({bid?.averageRating}/5)
                </span>
              </div>
              <span className="font-semibold mt-2">
                Total Reviews: ({bid?.totalReviews}){" "}
              </span>
              <div className="mt-4">
                {[5, 4, 3, 2, 1].map((num) => (
                  <div key={num} className="flex items-center gap-2 text-lg">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < num ? "text-yellow-500" : "text-gray-300"
                        }
                      />
                    ))}
                    <span className="text-gray-800">
                      ({bid?.ratingDistribution?.[num] || 0})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div className="mb-6 border p-4 rounded-lg bg-white shadow-sm w-full">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Work Details
            </h4>
            <p className="text-gray-700 text-lg leading-relaxed">
              {bid?.workdetails || "No work details provided."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
            <Button
              type="default"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg shadow-md w-full sm:w-auto"
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              type="primary"
              className="bg-green-600 border-none hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md w-full sm:w-auto"
              onClick={showModal}
            >
              Approve
            </Button>
          </div>
        </div>

        {/* Modal */}
        <Modal
          centered
          width={400}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <p className="text-xl font-semibold text-gray-800">
            Are you sure? You want to select this service provider’s bid?
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-4">
            <Button
              danger
              onClick={handleCancel}
              className="hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg"
            >
              No
            </Button>
            <Button
              type="primary"
              className="bg-green-600 border-none text-white px-4 py-2 rounded-lg"
              onClick={handleConfirm}
            >
              Yes
            </Button>
          </div>
        </Modal>
      </div>

      {/* Top Reviews */}
      <div className="mt-6 overflow-x-hidden">
        <TopReviews providerID={bid?.providerId} />
      </div>
    </>
  );
}
