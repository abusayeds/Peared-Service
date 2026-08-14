"use client";

import { Modal, Spin } from "antd";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaArrowLeft, FaList, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import ItemFormModal from "../../../../components/pm/ItemFormModal";
import KanbanBoard from "../../../../components/pm/KanbanBoard";
import { getImageUrl } from "../../../../lib/getImageUrl";
import {
  useCreatePmBugMutation,
  useCreatePmTaskMutation,
  useDeletePmBugMutation,
  useDeletePmTaskMutation,
  useGetPmProjectQuery,
  useUpdatePmBugMutation,
  useUpdatePmTaskMutation,
} from "../../../../redux/features/pm/pmApi";

export default function ProjectKanbanPage({ params, kind = "task" }) {
  const { id } = params;
  const isTask = kind === "task";
  const { data, isLoading } = useGetPmProjectQuery(id);
  const [createTask, { isLoading: ct }] = useCreatePmTaskMutation();
  const [updateTask, { isLoading: ut }] = useUpdatePmTaskMutation();
  const [deleteTask] = useDeletePmTaskMutation();
  const [createBug, { isLoading: cb }] = useCreatePmBugMutation();
  const [updateBug, { isLoading: ub }] = useUpdatePmBugMutation();
  const [deleteBug] = useDeletePmBugMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [defaultStageId, setDefaultStageId] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const payload = data?.data;
  const project = payload?.project;
  const stages = isTask ? payload?.stages?.task || [] : payload?.stages?.bug || [];
  const items = isTask ? payload?.tasks || [] : payload?.bugs || [];
  const people = useMemo(() => {
    const list = [];
    if (project?.ownerId) list.push(project.ownerId);
    (project?.assignedTo || []).forEach((p) => list.push(p));
    return list;
  }, [project]);

  const saving = ct || ut || cb || ub;

  const openCreate = (stageId) => {
    setEditing(null);
    setDefaultStageId(stageId || stages[0]?._id);
    setOpen(true);
  };

  const handleSave = async (values) => {
    if (isTask) {
      if (editing) await updateTask({ id: editing._id, ...values }).unwrap();
      else await createTask({ projectId: id, ...values }).unwrap();
    } else if (editing) {
      await updateBug({ id: editing._id, ...values }).unwrap();
    } else {
      await createBug({ projectId: id, ...values }).unwrap();
    }
    setOpen(false);
    setEditing(null);
  };

  const handleMove = async (itemId, stageId) => {
    if (isTask) await updateTask({ id: itemId, stageId });
    else await updateBug({ id: itemId, stageId });
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: `Delete ${isTask ? "task" : "bug"}?`,
      text: item.title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#5E9A2D",
      confirmButtonText: "Delete",
    }).then(async (res) => {
      if (!res.isConfirmed) return;
      if (isTask) await deleteTask(item._id);
      else await deleteBug(item._id);
    });
  };

  if (isLoading || !project) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F7F8FA] p-4 sm:p-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
          {project.title} — {isTask ? "Task Kanban" : "Bug"}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/profile/project-manage/${id}`}
            className="px-3 py-2 rounded-lg border bg-white text-sm min-h-[40px] inline-flex items-center gap-2"
          >
            <FaArrowLeft /> Back
          </Link>
          <Link
            href={`/profile/project-manage/${id}`}
            className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center"
          >
            <FaList />
          </Link>
          <button
            type="button"
            onClick={() => openCreate(stages[0]?._id)}
            className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center"
          >
            <FaPlus />
          </button>
        </div>
      </div>

      <KanbanBoard
        stages={stages}
        items={items}
        onMove={handleMove}
        onAdd={openCreate}
        onView={setViewItem}
        onEdit={(item) => {
          setEditing(item);
          setOpen(true);
        }}
        onDelete={handleDelete}
      />

      <ItemFormModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
        loading={saving}
        initial={editing}
        kind={kind}
        stages={stages}
        people={people}
        defaultStageId={defaultStageId}
      />

      <Modal
        title={viewItem?.title}
        open={!!viewItem}
        onCancel={() => setViewItem(null)}
        footer={null}
      >
        {viewItem && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Priority:</span> {viewItem.priority}
            </p>
            <p>
              <span className="text-gray-500">Status:</span>{" "}
              {viewItem.stageId?.name}
            </p>
            <p className="text-gray-700 whitespace-pre-wrap">
              {viewItem.description || "No description."}
            </p>
            <div className="flex gap-2 pt-2">
              {(viewItem.assignees || []).map((p) => (
                <img
                  key={p._id}
                  src={getImageUrl(p.image)}
                  title={p.name}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
