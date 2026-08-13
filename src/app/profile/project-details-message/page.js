"use client";

import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import Message from "../../../components/project-details-message/Message";
import { ErrorSwal, SuccessSwal } from "../../../components/utils/allSwalFire";
import { useSocket } from "../../../context/SocketContext";
import { getImageUrl } from "../../../lib/getImageUrl";
import {
  useConfirmProjectQuery,
  useProjectDoneByProviderMutation,
  useProjectNotOkByUserMutation,
  useProjectOkByUserMutation,
} from "../../../redux/features/projects/projectApi";

export default function ProjectDetails(props) {
  const { user } = useSelector((state) => state.auth) || {};
  const router = useRouter();
  const socket = useSocket();
  const { projectId } = props.searchParams;

  const { data, isLoading, refetch } = useConfirmProjectQuery(projectId, {
    skip: !projectId,
  });
  const conversationId = data?.data?.conversationId;
  const [liveStatus, setLiveStatus] = useState(null);
  const [showProjectPanel, setShowProjectPanel] = useState(false);

  const [projectOk] = useProjectOkByUserMutation();
  const [projectNotOk] = useProjectNotOkByUserMutation();
  const [projectDone] = useProjectDoneByProviderMutation();

  useEffect(() => {
    setLiveStatus(data?.data?.currentProjects?.isComplete || null);
  }, [data?.data?.currentProjects?.isComplete]);

  useEffect(() => {
    if (!socket || !projectId) return;

    const matches = (payload) =>
      String(payload?.projectId) === String(projectId) ||
      String(payload?.bitProjectId) === String(data?.data?.currentProjects?._id);

    const onProviderDone = (payload) => {
      if (!matches(payload)) return;
      setLiveStatus("complete");
      refetch();
    };
    const onUserOk = (payload) => {
      if (!matches(payload)) return;
      setLiveStatus("finished");
      refetch();
    };
    const onUserNotOk = (payload) => {
      if (!matches(payload)) return;
      setLiveStatus("running");
      refetch();
    };
    const onApproved = (payload) => {
      if (!matches(payload)) return;
      setLiveStatus("running");
      refetch();
    };

    socket.on("project:providerDone", onProviderDone);
    socket.on("project:userOk", onUserOk);
    socket.on("project:userNotOk", onUserNotOk);
    socket.on("bid:approved", onApproved);

    return () => {
      socket.off("project:providerDone", onProviderDone);
      socket.off("project:userOk", onUserOk);
      socket.off("project:userNotOk", onUserNotOk);
      socket.off("bid:approved", onApproved);
    };
  }, [socket, projectId, data?.data?.currentProjects?._id, refetch]);

  let formattedStartDate = "N/A";
  const startTimeValue = data?.data?.currentProjects?.startTime;
  if (startTimeValue) {
    const startDate = new Date(startTimeValue);
    if (!isNaN(startDate.getTime())) {
      formattedStartDate = format(startDate, "dd MMM yyyy");
    }
  }

  const handleProjectOk = async () => {
    await projectOk(data?.data?.currentProjects?._id).unwrap();
    setLiveStatus("finished");
    SuccessSwal({ title: "", text: "Project completed successfully!" });
    router.push(
      `/feedback?providerId=${data?.data?.currentProjects?.providerId?._id}`
    );
  };

  const handleProjectNotOk = async () => {
    const response = await projectNotOk(
      data?.data?.currentProjects?._id
    ).unwrap();
    setLiveStatus("running");
    ErrorSwal({
      title: "",
      text: response?.message || "Work marked as not complete",
    });
  };

  const handleProjectDone = async () => {
    try {
      await projectDone(data?.data?.currentProjects?._id).unwrap();
      setLiveStatus("complete");
      SuccessSwal({ title: "", text: "Done request sent to client!" });
    } catch (error) {
      ErrorSwal({
        title: "",
        text: error?.data?.message || error?.message || "Failed",
      });
    }
  };

  const handleReport = () => {
    user?.role === "provider"
      ? router.push(
          `/report?userId=${data?.data?.currentProjects?.projectId?.userId}&bidProjectId=${data?.data?.currentProjects?._id}`
        )
      : router.push(
          `/report?userId=${data?.data?.currentProjects?.providerId?._id}&bidProjectId=${data?.data?.currentProjects?._id}`
        );
  };

  const statusLabel =
    liveStatus === "complete"
      ? "Awaiting review"
      : liveStatus === "finished"
        ? "Completed"
        : liveStatus === "running"
          ? "In progress"
          : liveStatus || "—";

  const projectPanel = (
    <aside className="h-full min-h-0 flex flex-col bg-[#f0f2f5] border-l border-[#d1d7db]">
      <div className="shrink-0 h-[56px] px-4 flex items-center justify-between border-b border-[#d1d7db]">
        <h2 className="text-[15px] font-semibold text-[#111b21]">Project</h2>
        <span className="text-[11px] px-2 py-1 rounded-full bg-secondary text-primary font-medium">
          {statusLabel}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <div className="relative w-full h-36 overflow-hidden rounded-xl bg-white shadow-sm">
          <Image
            src={getImageUrl(data?.data?.currentProjects?.projectId?.image)}
            alt="project"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-sm space-y-2 text-sm">
          <p className="flex justify-between gap-2">
            <span className="text-[#667781]">Price</span>
            <span className="font-semibold text-primary">
              ${data?.data?.currentProjects?.price}
            </span>
          </p>
          <p className="flex justify-between gap-2">
            <span className="text-[#667781]">Time</span>
            <span className="font-medium text-[#111b21]">
              {data?.data?.currentProjects?.serviceTime} Days
            </span>
          </p>
          <p className="flex justify-between gap-2">
            <span className="text-[#667781]">Starting</span>
            <span className="font-medium text-[#111b21]">{formattedStartDate}</span>
          </p>
        </div>

        {user?.role === "provider" && (
          <div className="bg-white rounded-xl p-3.5 shadow-sm space-y-1.5 text-sm">
            <p className="font-semibold text-[#111b21]">
              {data?.data?.currentProjects?.projectId?.projectName}
            </p>
            <p className="text-[#667781]">
              {data?.data?.currentProjects?.projectId?.projectCategory}
            </p>
            <p className="text-[#111b21]">
              {data?.data?.currentProjects?.projectId?.city}
              {data?.data?.currentProjects?.projectId?.postCode
                ? ` · ${data?.data?.currentProjects?.projectId?.postCode}`
                : ""}
            </p>
            <p className="text-[#667781] text-xs">
              {data?.data?.currentProjects?.projectId?.street}
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm">
          {user?.role === "user" ? (
            <div>
              <h3 className="font-semibold text-center text-sm text-[#111b21] mb-1">
                Service completed?
              </h3>
              <p className="text-xs text-center text-[#667781] mb-3">
                {liveStatus !== "complete"
                  ? "Unlocks when provider marks done."
                  : "Confirm or reject live."}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleProjectNotOk}
                  disabled={liveStatus !== "complete"}
                  className="flex-1 border border-red-300 text-red-600 text-sm py-2 rounded-lg font-medium disabled:opacity-40"
                >
                  No
                </button>
                <button
                  onClick={handleProjectOk}
                  disabled={liveStatus !== "complete"}
                  className="flex-1 bg-primary text-white text-sm py-2 rounded-lg font-medium disabled:opacity-40"
                >
                  Yes
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-center text-sm text-[#111b21] mb-1">
                Work done?
              </h3>
              <p className="text-xs text-center text-[#667781] mb-3">
                Client gets a live accept / reject request.
              </p>
              <button
                onClick={handleProjectDone}
                disabled={liveStatus === "complete" || liveStatus === "finished"}
                className="w-full bg-primary text-white text-sm py-2.5 rounded-lg font-medium disabled:opacity-40"
              >
                {liveStatus === "complete" || liveStatus === "finished"
                  ? "Request sent"
                  : "Mark as Done"}
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-5rem)] flex items-center justify-center text-[#667781]">
        Loading chat…
      </div>
    );
  }

  return (
    // Fits under global Navbar + beside profile Sidebar (collapse still works)
    <div className="h-[calc(100vh-5rem)] md:h-[calc(100vh-5rem)] pb-16 md:pb-0 flex overflow-hidden bg-[#e5ddd5]">
      {/* Middle: chat */}
      <div className="relative flex-1 min-w-0 min-h-0 flex flex-col border-r border-[#d1d7db]">
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
          peerUserId={
            user?.role === "provider"
              ? data?.data?.currentProjects?.projectId?.userId
              : data?.data?.currentProjects?.providerId?._id
          }
          projectStatus={liveStatus}
        />

        <button
          type="button"
          onClick={() => setShowProjectPanel(true)}
          className="lg:hidden absolute top-[14px] right-3 z-20 h-9 w-9 rounded-full bg-white/90 text-primary shadow flex items-center justify-center"
          title="Project details"
        >
          <FaInfoCircle size={16} />
        </button>
      </div>

      {/* Right: project panel (desktop) */}
      <div className="hidden lg:flex w-[320px] xl:w-[360px] shrink-0 h-full min-h-0 flex-col">
        {projectPanel}
      </div>

      {/* Mobile project drawer */}
      {showProjectPanel && (
        <div className="lg:hidden fixed inset-0 z-[60] flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close"
            onClick={() => setShowProjectPanel(false)}
          />
          <div className="relative w-[min(100%,360px)] h-full shadow-2xl bg-white">
            {projectPanel}
          </div>
        </div>
      )}
    </div>
  );
}
