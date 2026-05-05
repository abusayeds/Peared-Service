"use client";

import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Message from "../../../components/project-details-message/Message";
import { ErrorSwal, SuccessSwal } from "../../../components/utils/allSwalFire";
import {
  useConfirmProjectQuery,
  useProjectDoneByProviderMutation,
  useProjectNotOkByUserMutation,
  useProjectOkByUserMutation,
} from "../../../redux/features/projects/projectApi";

export default function ProjectDetails(props) {
  const { user } = useSelector((state) => state.auth) || {};
  const router = useRouter();
  const { projectId } = props.searchParams;

  const { data, isLoading } = useConfirmProjectQuery(projectId);
  const conversationId = data?.data?.conversationId;

  const [projectOk] = useProjectOkByUserMutation();
  const [projectNotOk] = useProjectNotOkByUserMutation();
  const [projectDone] = useProjectDoneByProviderMutation();

  let formattedStartDate = "N/A";
  const startTimeValue = data?.data?.currentProjects?.startTime;
  if (startTimeValue) {
    const startDate = new Date(startTimeValue);
    if (!isNaN(startDate.getTime())) {
      formattedStartDate = format(startDate, "dd MMM yyyy");
    } else {
      console.error("Invalid date:", startTimeValue);
    }
  }

  const handleProjectOk = async () => {
    await projectOk(data?.data?.currentProjects?._id).unwrap();
    SuccessSwal({
      title: "",
      text: "Project completed successfully!",
    });
    router.push(
      `/feedback?providerId=${data?.data?.currentProjects?.providerId?._id}`
    );
  };

  const handleProjectNotOk = async () => {
    const response = await projectNotOk(
      data?.data?.currentProjects?._id
    ).unwrap();
    ErrorSwal({
      title: "",
      text: response?.message || response?.data?.message,
    });
  };

  const handleProjectDone = async () => {
    try {
      await projectDone(data?.data?.currentProjects?._id).unwrap();
      SuccessSwal({
        title: "",
        text: "Project completed successfully!",
      });
    } catch (error) {
      ErrorSwal({
        title: "",
        text: error?.message || error?.data?.message,
      });
    }
  };

  const handleReport = () => {
    user?.role === "provider"
      ? router.push(
          `/report?userId=${data?.data?.currentProjects?.projectId?.userId}&bidProjectId=${data?.data?.currentProjects?._id}`
        ) // user id
      : router.push(
          `/report?userId=${data?.data?.currentProjects?.providerId?._id}&bidProjectId=${data?.data?.currentProjects?._id}`
        ); // provider id
  };

  return (
    <div className="md:h-[80vh] w-full flex flex-col bg-gray-100 md:overflow-auto pb-20">
      <div className="relative flex items-center justify-center flex-shrink-0 md:py-8 md:p-6 border-b">
        <button
          onClick={handleReport}
          className="hidden md:block absolute right-4 bg-red-600 text-white text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 rounded-md shadow-md hover:bg-red-700 transition"
        >
          Report
        </button>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:p-6">
        <div className="md:col-span-2 flex flex-col sm:h-[70vh] md:h-full overflow-hidden">
          <Message
            data={data}
            handleProjectOk={handleProjectOk}
            handleProjectNotOk={handleProjectNotOk}
            handleProjectDone={handleProjectDone}
            handleReport={handleReport}
            conversationId={conversationId}
            userId={user?._id}
            providerData={data}
            providerId={data?.data?.currentProjects?.providerId?._id}
          />
        </div>
        {/* divider */}
        {/* divider */}
        {/* divider */}
        {/* divider */}
        <div className="hidden md:block">
          <div className=" md:col-span-1 bg-white rounded-lg shadow-lg p-4 md:p-6 flex flex-col h-full overflow-auto">
            <h2 className="text-lg md:text-xl text-primary font-bold mb-4">
              Project Details
            </h2>
            <div className="md:flex justify-between items-center gap-8">
              <div>
                <p className="text-primary font-bold text-sm md:text-base mb-1">
                  <span className="font-semibold text-black">Price:</span> ${" "}
                  {data?.data?.currentProjects?.price}
                </p>
                <p className="text-primary font-bold text-sm md:text-base mb-1">
                  <span className="font-semibold text-black">Time:</span>{" "}
                  {data?.data?.currentProjects?.serviceTime} Days
                </p>
                <p className="text-primary font-bold text-sm md:text-base mb-1">
                  <span className="font-semibold text-black">Starting:</span>{" "}
                  {formattedStartDate}
                </p>
              </div>
              <div className="relative w-[80%] md:w-[50%] h-32 md:h-32 lg:h-32 mb-6">
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${data?.data?.currentProjects?.projectId?.image}`}
                  alt="project_img"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg shadow-lg"
                  priority
                />
              </div>
            </div>
            {user?.role === "provider" ? (
              <>
                <p className="text-primary font-bold text-2xl mt-2 mb-1">
                  {data?.data?.currentProjects?.projectId?.projectName}
                </p>
                <p className="text-primary font-bold text-sm md:text-base mb-1">
                  <span className="font-semibold text-black ">Category:</span>{" "}
                  {data?.data?.currentProjects?.projectId?.projectCategory}
                </p>
                <p className="text-primary font-bold text-sm md:text-base mb-1">
                  <span className="font-semibold text-black ">City:</span>{" "}
                  {data?.data?.currentProjects?.projectId?.city}
                </p>
                <p className="text-primary font-bold text-sm md:text-base mb-1">
                  <span className="font-semibold text-black ">Post Code:</span>{" "}
                  {data?.data?.currentProjects?.projectId?.postCode}
                </p>
                <p className="text-primary font-bold text-sm md:text-base mb-1">
                  <span className="font-semibold text-black ">Street:</span>{" "}
                  {data?.data?.currentProjects?.projectId?.street}
                </p>
              </>
            ) : null}
            <div className="mt-6 bg-gray-50 rounded-lg p-4 flex-1">
              {user?.role === "user" ? (
                <div className="relative">
                  {data?.data?.currentProjects?.isComplete !== "complete" && (
                    <div className="w-full h-full rounded-lg absolute bg-gray-500/50 top-0 left-0"></div>
                  )}
                  <div className="p-2 md:p-4">
                    <h3 className="font-semibold text-center mb-2 text-sm md:text-base">
                      Did you get services Done?
                    </h3>
                    <p className="text-xs md:text-sm text-center mb-2">
                      {data?.data?.currentProjects?.isComplete !== "complete"
                        ? "After completing this project you can access these buttons."
                        : ""}
                    </p>
                    <div className="mt-4 flex justify-center items-center gap-4">
                      <button
                        onClick={handleProjectNotOk}
                        className="border border-red-500 text-red-700 text-xs md:text-sm px-3 md:px-5 py-1 md:py-2 rounded-xl font-medium shadow-md hover:bg-red-200 transition"
                      >
                        No
                      </button>
                      <button
                        onClick={handleProjectOk}
                        className="bg-green-600 text-white text-xs md:text-sm px-3 md:px-5 py-1 md:py-2 rounded-xl font-medium shadow-md hover:bg-green-700 transition"
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2 md:p-4">
                  <h3 className="font-semibold text-center mb-2 text-sm md:text-base">
                    Is your work done?
                  </h3>
                  <p className="text-xs md:text-sm text-center mb-2">
                    {
                      "If you click this button, we'll send your client a work done request. If they approve, you get your payment."
                    }
                  </p>
                  <div className="mt-4 flex justify-center items-center">
                    <button
                      onClick={handleProjectDone}
                      className="bg-green-600 text-white text-xs md:text-sm px-3 md:px-5 py-1 md:py-2 rounded-xl font-medium shadow-md hover:bg-green-700 transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
