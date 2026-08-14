"use client";

import { Input, Modal, Spin, Tabs, Upload } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaBug,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaFolderOpen,
  FaPaperclip,
  FaPlus,
  FaTasks,
  FaTrash,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import { money, statusMeta, ymd } from "../../../../components/pm/pmUtils";
import { getImageUrl } from "../../../../lib/getImageUrl";
import {
  useAddPmAttachmentMutation,
  useCreatePmMilestoneMutation,
  useDeletePmAttachmentMutation,
  useDeletePmMilestoneMutation,
  useGetPmProjectQuery,
  useUpdatePmMilestoneMutation,
} from "../../../../redux/features/pm/pmApi";

export default function ProjectManageDetail({ params }) {
  const { id } = params;
  const router = useRouter();
  const { data, isLoading } = useGetPmProjectQuery(id);
  const [addFile] = useAddPmAttachmentMutation();
  const [delFile] = useDeletePmAttachmentMutation();
  const [addMs] = useCreatePmMilestoneMutation();
  const [updMs] = useUpdatePmMilestoneMutation();
  const [delMs] = useDeletePmMilestoneMutation();
  const [msOpen, setMsOpen] = useState(false);
  const [msForm, setMsForm] = useState({ name: "", cost: "", progress: 0 });

  const payload = data?.data;
  const project = payload?.project;
  const summary = payload?.summary || {};
  const isOwner = payload?.isOwner;
  const st = statusMeta[project?.status] || statusMeta.ongoing;

  const teamPeople = useMemo(() => {
    const list = [];
    if (project?.ownerId) list.push({ ...project.ownerId, kind: "Client" });
    (project?.assignedTo || []).forEach((p) =>
      list.push({ ...p, kind: "Provider" })
    );
    return list;
  }, [project]);

  if (isLoading || !project) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const percent = project.progress?.percent || 0;

  const uploadProps = {
    showUploadList: false,
    beforeUpload: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      await addFile({ projectId: id, formData }).unwrap();
      return false;
    },
  };

  const saveMilestone = async () => {
    if (!msForm.name.trim()) return;
    await addMs({
      projectId: id,
      name: msForm.name,
      cost: Number(msForm.cost) || 0,
      progress: Number(msForm.progress) || 0,
      startDate: msForm.startDate || null,
      endDate: msForm.endDate || null,
    }).unwrap();
    setMsOpen(false);
    setMsForm({ name: "", cost: "", progress: 0 });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F7F8FA] p-4 sm:p-6 pb-24 md:pb-8">
      <p className="text-xs text-gray-400 mb-2 truncate">
        Dashboard &gt; Project &gt; {project.title}
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
          {project.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => router.push("/profile/project-manage")}
            className="px-3 py-2 rounded-lg border bg-white text-sm min-h-[40px] inline-flex items-center gap-2"
          >
            <FaArrowLeft /> Back
          </button>
          <Link
            href={`/profile/project-manage/${id}/tasks`}
            className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center"
            title="Tasks"
          >
            <FaTasks />
          </Link>
          <Link
            href={`/profile/project-manage/${id}/bugs`}
            className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center"
            title="Bugs"
          >
            <FaBug />
          </Link>
          {isOwner && (
            <Link
              href="/profile/project-manage/setup"
              className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center"
              title="Stages"
            >
              <FaCheckCircle />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Team Members",
            value: summary.members || 0,
            sub: "Members & Clients",
            wrap: "bg-sky-50",
            icon: <FaUsers className="text-sky-500" />,
          },
          {
            label: "Deadline",
            value: ymd(project.deadline),
            sub: "Due Date",
            wrap: "bg-emerald-50",
            icon: <FaCalendarAlt className="text-emerald-600" />,
          },
          {
            label: "Budget",
            value: project.budgetLabel || money(project.budget),
            sub: "From listing / bid",
            wrap: "bg-amber-50",
            icon: <FaDollarSign className="text-amber-600" />,
          },
          {
            label: "Days Left",
            value: Math.max(0, project.daysLeft || 0),
            sub: "Days Remaining",
            wrap: "bg-violet-50",
            icon: <FaClock className="text-violet-600" />,
          },
        ].map((c) => (
          <div key={c.label} className={`rounded-xl p-4 ${c.wrap}`}>
            <div className="flex justify-between items-start">
              <p className="text-xs text-gray-500">{c.label}</p>
              {c.icon}
            </div>
            <p className="text-lg sm:text-xl font-bold mt-2 break-all">{c.value}</p>
            <p className="text-[11px] text-gray-500">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <p className="font-semibold">Project Progress</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${st.badge}`}>
            {st.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-primary font-semibold text-sm">{percent}%</span>
        </div>
      </div>

      <Tabs
        items={[
          {
            key: "overview",
            label: "Overview",
            children: (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold flex items-center gap-2">
                        <FaFolderOpen className="text-primary" /> Project
                        Description
                      </p>
                      {isOwner && (
                        <Link
                          href={`/profile/my-projects/${id}`}
                          className="text-xs text-primary"
                        >
                          Open listing
                        </Link>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {project.description || "No description yet."}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="font-semibold mb-3">Task Progress Chart</p>
                    <div className="flex items-end gap-3 h-40">
                      {(summary.chart || []).length === 0 && (
                        <p className="text-sm text-gray-400">No task data yet.</p>
                      )}
                      {(summary.chart || []).map((c) => (
                        <div key={c.month} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full max-w-[28px] bg-primary/80 rounded-t"
                            style={{
                              height: `${Math.max(8, (c.count / Math.max(...(summary.chart.map((x) => x.count) || [1]))) * 120)}px`,
                            }}
                          />
                          <span className="text-[10px] mt-1 text-gray-500">
                            {c.month}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="font-semibold flex items-center gap-2 mb-3">
                      <FaCalendarAlt className="text-primary" /> Project Timeline
                    </p>
                    <div className="text-sm space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-500">Start Date</span>
                        <span>{ymd(project.startDate)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Deadline</span>
                        <span className="text-red-500">{ymd(project.deadline)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Budget</span>
                        <span>{project.budgetLabel || money(project.budget)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="font-semibold flex items-center gap-2 mb-3">
                      <FaUserFriends className="text-primary" /> Team Summary
                    </p>
                    <div className="text-sm space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-500">Clients</span>
                        <span>{summary.clients || 1}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Providers</span>
                        <span>{summary.providers || 0}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "team",
            label: "Team",
            children: (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="space-y-3">
                  {teamPeople.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center gap-3 border-b border-gray-100 pb-3"
                    >
                      <img
                        src={getImageUrl(p.image)}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.kind}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            key: "milestones",
            label: "Milestones",
            children: (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setMsOpen(true)}
                    className="mb-3 inline-flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-sm"
                  >
                    <FaPlus /> Add Milestone
                  </button>
                )}
                <div className="space-y-3">
                  {(payload.milestones || []).map((m) => (
                    <div
                      key={m._id}
                      className="border border-gray-200 rounded-xl p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-gray-500">
                            {ymd(m.startDate)} — {ymd(m.endDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {money(m.cost)}
                          </span>
                          {isOwner && (
                            <button
                              type="button"
                              className="text-red-500 p-2"
                              onClick={() => delMs(m._id)}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${m.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs">{m.progress || 0}%</span>
                        <button
                          type="button"
                          className={`text-[11px] px-2 py-0.5 rounded-full ${
                            m.status === "Complete"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-600"
                          }`}
                          onClick={() =>
                            isOwner &&
                            updMs({
                              id: m._id,
                              status:
                                m.status === "Complete"
                                  ? "Incomplete"
                                  : "Complete",
                              progress: m.status === "Complete" ? m.progress : 100,
                            })
                          }
                        >
                          {m.status}
                        </button>
                      </div>
                    </div>
                  ))}
                  {(payload.milestones || []).length === 0 && (
                    <p className="text-sm text-gray-400">No milestones yet.</p>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "attachments",
            label: "Attachments",
            children: (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <Upload {...uploadProps}>
                  <button
                    type="button"
                    className="mb-3 inline-flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-sm"
                  >
                    <FaPaperclip /> Upload file
                  </button>
                </Upload>
                <div className="space-y-2">
                  {(payload.attachments || []).map((a) => (
                    <div
                      key={a._id}
                      className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg p-3"
                    >
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary truncate"
                      >
                        {a.name}
                      </a>
                      <button
                        type="button"
                        className="text-red-500 p-2"
                        onClick={() => delFile(a._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            key: "activity",
            label: "Activity",
            children: (
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                {(payload.activities || []).map((a) => (
                  <div key={a._id} className="flex gap-3">
                    <img
                      src={getImageUrl(a.userId?.image)}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{a.userId?.name}</span>{" "}
                        {a.message}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {(payload.activities || []).length === 0 && (
                  <p className="text-sm text-gray-400">No activity yet.</p>
                )}
              </div>
            ),
          },
        ]}
      />

      <Modal
        title="Add Milestone"
        open={msOpen}
        onCancel={() => setMsOpen(false)}
        onOk={saveMilestone}
        okButtonProps={{ className: "!bg-primary !border-primary" }}
      >
        <div className="space-y-3 mt-3">
          <Input
            placeholder="Name"
            value={msForm.name}
            onChange={(e) => setMsForm({ ...msForm, name: e.target.value })}
          />
          <Input
            placeholder="Cost"
            type="number"
            value={msForm.cost}
            onChange={(e) => setMsForm({ ...msForm, cost: e.target.value })}
          />
          <Input
            placeholder="Progress %"
            type="number"
            value={msForm.progress}
            onChange={(e) => setMsForm({ ...msForm, progress: e.target.value })}
          />
          <Input
            type="date"
            value={msForm.startDate || ""}
            onChange={(e) => setMsForm({ ...msForm, startDate: e.target.value })}
          />
          <Input
            type="date"
            value={msForm.endDate || ""}
            onChange={(e) => setMsForm({ ...msForm, endDate: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
