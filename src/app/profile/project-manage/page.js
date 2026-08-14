"use client";

import { Input, Pagination, Select, Spin } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaPause,
  FaPlay,
  FaPlus,
  FaSearch,
  FaThLarge,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import CreateManageModal from "../../../components/pm/CreateManageModal";
import ProjectCard from "../../../components/pm/ProjectCard";
import {
  useCreatePmProjectMutation,
  useDeletePmProjectMutation,
  useGetPmProjectsQuery,
} from "../../../redux/features/pm/pmApi";

const STAT_CARDS = [
  {
    key: "total",
    label: "Total Projects",
    icon: FaThLarge,
    wrap: "bg-sky-50 text-sky-700",
    iconWrap: "bg-sky-500 text-white",
  },
  {
    key: "ongoing",
    label: "Ongoing",
    icon: FaPlay,
    wrap: "bg-emerald-50 text-emerald-700",
    iconWrap: "bg-emerald-500 text-white",
  },
  {
    key: "onhold",
    label: "On Hold",
    icon: FaPause,
    wrap: "bg-amber-50 text-amber-700",
    iconWrap: "bg-amber-500 text-white",
  },
  {
    key: "finished",
    label: "Completed",
    icon: FaCheckCircle,
    wrap: "bg-violet-50 text-violet-700",
    iconWrap: "bg-violet-500 text-white",
  },
  {
    key: "overdue",
    label: "Overdue",
    icon: FaExclamationCircle,
    wrap: "bg-red-50 text-red-700",
    iconWrap: "bg-red-500 text-white",
  },
];

export default function ProjectManagePage() {
  const router = useRouter();
  const { user } = useSelector((s) => s.auth);
  const isProvider = user?.role === "provider";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useGetPmProjectsQuery({
    page,
    limit,
    searchTerm: appliedSearch,
    status,
  });
  const [createProject, { isLoading: creating }] = useCreatePmProjectMutation();
  const [deleteProject] = useDeletePmProjectMutation();

  const stats = data?.data?.stats || {
    total: 0,
    ongoing: 0,
    onhold: 0,
    finished: 0,
    overdue: 0,
  };
  const projects = data?.data?.projects || [];
  const pagination = data?.pagination || {};

  const tabs = useMemo(
    () => [
      { key: "", label: "All", count: stats.total },
      { key: "ongoing", label: "Ongoing", count: stats.ongoing },
      { key: "onhold", label: "On Hold", count: stats.onhold },
      { key: "finished", label: "Finished", count: stats.finished },
    ],
    [stats]
  );

  const sub = (key) => {
    if (key === "total") return "All time";
    const n = stats[key] || 0;
    const pct = stats.total ? Math.round((n / stats.total) * 100) : 0;
    return `${pct}% of total`;
  };

  const handleCreate = async (projectId) => {
    try {
      const res = await createProject({ projectId }).unwrap();
      const id = res?.data?._id || res?.data?.projectId || projectId;
      setCreateOpen(false);
      router.push(`/profile/project-manage/${id}`);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err?.data?.message || "Could not add this project",
        confirmButtonColor: "#5E9A2D",
      });
    }
  };

  const handleRemove = (project) => {
    Swal.fire({
      title: "Remove from Project Manage?",
      text: project.title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#5E9A2D",
      confirmButtonText: "Remove",
    }).then(async (res) => {
      if (res.isConfirmed) await deleteProject(project._id);
    });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F7F8FA] p-4 sm:p-6 pb-24 md:pb-8">
      <p className="text-xs text-gray-400 mb-2">Dashboard &gt; Projects</p>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Manage Projects
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Add an in-progress project to track its status, tasks, and bugs.
            Deadline and budget come from the listing.
          </p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <Link
              href="/profile/project-manage/reports"
              className="text-primary font-medium"
            >
              Project Report
            </Link>
            <Link
              href="/profile/project-manage/setup"
              className="text-primary font-medium"
            >
              System Setup
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-medium min-h-[44px] shrink-0"
        >
          <FaPlus /> Create
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {STAT_CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.key}
              className={`rounded-xl p-3 sm:p-4 flex items-center justify-between ${c.wrap}`}
            >
              <div>
                <p className="text-xs font-medium opacity-80">{c.label}</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  {stats[c.key] || 0}
                </p>
                <p className="text-[11px] opacity-70">{sub(c.key)}</p>
              </div>
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.iconWrap}`}
              >
                <Icon size={14} />
              </span>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex-1 flex gap-2">
            <Input
              allowClear
              prefix={<FaSearch className="text-gray-400" />}
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => {
                setAppliedSearch(search);
                setPage(1);
              }}
            />
            <button
              type="button"
              onClick={() => {
                setAppliedSearch(search);
                setPage(1);
              }}
              className="bg-primary text-white px-4 rounded-lg min-h-[40px] shrink-0"
            >
              Search
            </button>
          </div>
          <Select
            value={limit}
            onChange={(v) => {
              setLimit(v);
              setPage(1);
            }}
            className="w-full lg:w-36"
            options={[
              { value: 8, label: "8 per page" },
              { value: 12, label: "12 per page" },
              { value: 24, label: "24 per page" },
            ]}
          />
        </div>
        <div className="flex gap-4 mt-3 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key || "all"}
              type="button"
              onClick={() => {
                setStatus(t.key);
                setPage(1);
              }}
              className={`whitespace-nowrap pb-2 text-sm ${
                status === t.key
                  ? "text-primary font-semibold border-b-2 border-primary"
                  : "text-gray-500"
              }`}
            >
              {t.label} {t.count}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          <p>No managed projects yet.</p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 mt-3 bg-primary text-white px-4 py-2.5 rounded-lg font-medium min-h-[44px]"
          >
            <FaPlus /> Create from in-progress project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard
              key={p._id}
              project={p}
              isProvider={isProvider}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {pagination.totalPage > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            current={page}
            pageSize={limit}
            total={pagination.totalData || 0}
            onChange={setPage}
          />
        </div>
      )}

      <CreateManageModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={creating}
        isProvider={isProvider}
      />
    </div>
  );
}
