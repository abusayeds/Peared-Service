"use client";

import Link from "next/link";
import { Spin } from "antd";
import { FaArrowLeft } from "react-icons/fa";
import AvatarStack from "../../../../../components/pm/AvatarStack";
import { money, statusMeta, ymd } from "../../../../../components/pm/pmUtils";
import { useGetPmProjectQuery } from "../../../../../redux/features/pm/pmApi";

export default function ProjectReportDetail({ params }) {
  const { id } = params;
  const { data, isLoading } = useGetPmProjectQuery(id);
  const payload = data?.data;
  const project = payload?.project;
  const summary = payload?.summary || {};
  const st = statusMeta[project?.status] || statusMeta.ongoing;

  if (isLoading || !project) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const tasks = payload.tasks || [];
  const done = summary.taskDone || 0;
  const todo = tasks.length - done;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F7F8FA] p-4 sm:p-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h1 className="text-xl sm:text-2xl font-bold">
          Project Report: {project.title}
        </h1>
        <Link
          href="/profile/project-manage/reports"
          className="px-3 py-2 rounded-lg border bg-white text-sm inline-flex items-center gap-2"
        >
          <FaArrowLeft /> Back
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Project</p>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${st.badge}`}>
            {st.label}
          </span>
          <p className="font-semibold mt-2">{project.title}</p>
          <p className="text-primary font-bold">
            {project.budgetLabel || money(project.budget)}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Timeline</p>
          <p className="text-sm mt-2">Start: {ymd(project.startDate)}</p>
          <p className="text-sm text-red-500">End: {ymd(project.deadline)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Tasks</p>
          <p className="text-2xl font-bold mt-1">{summary.taskTotal || 0}</p>
          <p className="text-xs text-emerald-600">{done} Completed</p>
          <p className="text-xs text-amber-600">{todo} Remaining</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Progress</p>
          <p className="text-2xl font-bold mt-1">
            {project.progress?.percent || 0}%
          </p>
          <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${project.progress?.percent || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="font-semibold mb-3">Users</p>
          <div className="flex items-center gap-3">
            <AvatarStack
              people={[project.ownerId, ...(project.assignedTo || [])].filter(
                Boolean
              )}
              max={8}
              size={36}
            />
          </div>
          <div className="mt-4 space-y-2">
            {[project.ownerId, ...(project.assignedTo || [])]
              .filter(Boolean)
              .map((p) => (
                <div key={p._id} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-gray-400">{p.role}</span>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="font-semibold mb-3">
            Milestones ({summary.milestoneTotal || 0})
          </p>
          {(payload.milestones || []).map((m) => (
            <div key={m._id} className="border-b border-gray-100 py-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{m.name}</span>
                <span>{money(m.cost)}</span>
              </div>
              <p className="text-xs text-gray-400">
                {ymd(m.startDate)} — {ymd(m.endDate)}
              </p>
              <p
                className={`text-xs mt-1 ${
                  m.status === "Complete" ? "text-primary" : "text-red-500"
                }`}
              >
                {m.status}
              </p>
            </div>
          ))}
          {(payload.milestones || []).length === 0 && (
            <p className="text-sm text-gray-400">No milestones.</p>
          )}
        </div>
      </div>
    </div>
  );
}
