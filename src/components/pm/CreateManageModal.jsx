"use client";

import { Modal, Select, Spin } from "antd";
import { useMemo, useState } from "react";
import { FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import { useGetPmEligibleQuery } from "../../redux/features/pm/pmApi";
import AvatarStack from "./AvatarStack";
import { money, statusMeta, ymd } from "./pmUtils";

export default function CreateManageModal({
  open,
  onClose,
  onSubmit,
  loading,
  isProvider,
}) {
  const { data, isLoading, isError } = useGetPmEligibleQuery(undefined, {
    skip: !open,
  });
  const options = Array.isArray(data?.data) ? data.data : [];
  const [projectId, setProjectId] = useState(null);

  const selected = useMemo(
    () => options.find((p) => p._id === projectId) || null,
    [options, projectId]
  );
  const st = statusMeta[selected?.status] || statusMeta.ongoing;
  const people = isProvider
    ? [selected?.ownerId].filter(Boolean)
    : selected?.assignedTo || [];

  const handleOk = async () => {
    if (!projectId) return;
    await onSubmit(projectId);
    setProjectId(null);
  };

  return (
    <Modal
      title={<span className="text-lg font-semibold">Create Project Manage</span>}
      open={open}
      onCancel={() => {
        setProjectId(null);
        onClose();
      }}
      onOk={handleOk}
      okText="Create"
      confirmLoading={loading}
      okButtonProps={{
        disabled: !projectId,
        className: "!bg-primary !border-primary hover:!bg-primary/90",
      }}
      destroyOnClose
    >
      <p className="text-sm text-gray-500 mb-3">
        Select a running project. Deadline and budget come from that listing.
        Tasks, bugs, and stages stay on your account only.
      </p>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-500 py-4">
          Could not load in-progress projects. Refresh and try again.
        </p>
      ) : options.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">
          No in-progress projects left to add. Start work on a posted project
          first.
        </p>
      ) : (
        <>
          <Select
            showSearch
            className="w-full"
            placeholder="Select in-progress project"
            optionFilterProp="label"
            value={projectId || undefined}
            onChange={setProjectId}
            options={options.map((p) => ({
              value: p._id,
              label: p.title,
            }))}
          />
          {selected && (
            <div className="mt-4 rounded-xl border border-hash/40 bg-secondary/50 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-900">{selected.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${st.badge}`}>
                  {st.label}
                </span>
              </div>
              {selected.description && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {selected.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">Deadline</p>
                  <p className="flex items-center gap-1 text-gray-700">
                    <FaCalendarAlt className="text-red-400" />
                    {ymd(selected.deadline)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">Budget</p>
                  <p className="flex items-center gap-1 text-gray-700">
                    <FaDollarSign className="text-primary" />
                    {selected.budgetLabel || money(selected.budget)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-1">
                  {isProvider ? "Assigned by" : "Assigned to"}
                </p>
                <AvatarStack people={people} />
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
