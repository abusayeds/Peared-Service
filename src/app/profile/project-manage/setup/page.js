"use client";

import { Spin } from "antd";
import Link from "next/link";
import { FaArrowLeft, FaBug, FaTasks } from "react-icons/fa";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import StageSetup from "../../../../components/pm/StageSetup";
import {
  useCreatePmStageMutation,
  useDeletePmStageMutation,
  useGetPmStagesQuery,
  useUpdatePmStageMutation,
} from "../../../../redux/features/pm/pmApi";

export default function ProjectManageSetup() {
  const { user } = useSelector((s) => s.auth);
  const { data, isLoading } = useGetPmStagesQuery({}, { skip: !user });
  const [createStage, { isLoading: creating }] = useCreatePmStageMutation();
  const [updateStage] = useUpdatePmStageMutation();
  const [deleteStage] = useDeletePmStageMutation();

  const stages = data?.data || [];
  const taskStages = stages.filter((s) => s.type === "task");
  const bugStages = stages.filter((s) => s.type === "bug");

  const onDelete = (stage) => {
    Swal.fire({
      title: "Delete stage?",
      text: stage.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#5E9A2D",
    }).then(async (res) => {
      if (res.isConfirmed) await deleteStage(stage._id);
    });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F7F8FA] p-4 sm:p-6 pb-24 md:pb-8">
      <Link
        href="/profile/project-manage"
        className="inline-flex items-center gap-2 text-sm text-gray-600 mb-4"
      >
        <FaArrowLeft /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-1">System Setup</h1>
      <p className="text-sm text-gray-500 mb-5 max-w-2xl">
        These stages are yours only. Add names and colors you want — for example
        Error, Fix:error, Dev:error. The other person on the same project cannot
        see or change this.
      </p>
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
              <FaTasks /> Task Stage
            </p>
            <StageSetup
              title="Task Stage"
              stages={taskStages}
              creating={creating}
              onCreate={(v) => createStage({ ...v, type: "task" })}
              onUpdate={(id, v) => updateStage({ id, ...v })}
              onDelete={onDelete}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
              <FaBug /> Bug Stage
            </p>
            <StageSetup
              title="Bug Stage"
              stages={bugStages}
              creating={creating}
              onCreate={(v) => createStage({ ...v, type: "bug" })}
              onUpdate={(id, v) => updateStage({ id, ...v })}
              onDelete={onDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
