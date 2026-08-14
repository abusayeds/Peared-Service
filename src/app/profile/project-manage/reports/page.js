"use client";

import { Input, Pagination, Spin } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEye, FaSearch, FaTasks } from "react-icons/fa";
import { useSelector } from "react-redux";
import AvatarStack from "../../../../components/pm/AvatarStack";
import { money, statusMeta, ymd } from "../../../../components/pm/pmUtils";
import { useGetPmProjectsQuery } from "../../../../redux/features/pm/pmApi";

export default function ProjectReportsPage() {
  const router = useRouter();
  const { user } = useSelector((s) => s.auth);
  const isProvider = user?.role === "provider";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const { data, isLoading } = useGetPmProjectsQuery({
    page,
    limit: 10,
    searchTerm: applied,
  });
  const stats = data?.data?.stats || {};
  const projects = data?.data?.projects || [];
  const pagination = data?.pagination || {};

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F7F8FA] p-4 sm:p-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Manage Project Reports</h1>
        <Link href="/profile/project-manage" className="text-sm text-primary">
          Card view
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {[
          ["Total Projects", stats.total, "bg-sky-50"],
          ["Ongoing", stats.ongoing, "bg-emerald-50"],
          ["On Hold", stats.onhold, "bg-amber-50"],
          ["Completed", stats.finished, "bg-violet-50"],
          ["Overdue", stats.overdue, "bg-red-50"],
        ].map(([label, n, wrap]) => (
          <div key={label} className={`rounded-xl p-3 ${wrap}`}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold">{n || 0}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          prefix={<FaSearch className="text-gray-400" />}
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={() => {
            setApplied(search);
            setPage(1);
          }}
        />
        <button
          type="button"
          className="bg-primary text-white px-4 rounded-lg"
          onClick={() => {
            setApplied(search);
            setPage(1);
          }}
        >
          Search
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Spin />
          </div>
        ) : (
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left p-3">Project Name</th>
                <th className="text-left p-3">Assign to</th>
                <th className="text-left p-3">Start</th>
                <th className="text-left p-3">End</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Progress</th>
                <th className="text-left p-3">Budget</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const st = statusMeta[p.status] || statusMeta.ongoing;
                return (
                  <tr key={p._id} className="border-t border-gray-100">
                    <td className="p-3">
                      <p className="font-medium">{p.title}</p>
                    </td>
                    <td className="p-3">
                      <AvatarStack
                        people={
                          isProvider ? [p.ownerId].filter(Boolean) : p.assignedTo
                        }
                      />
                    </td>
                    <td className="p-3 whitespace-nowrap">{ymd(p.startDate)}</td>
                    <td className="p-3 whitespace-nowrap text-red-500">
                      {ymd(p.deadline)}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${st.badge}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="p-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <span>{p.progress?.percent || 0}%</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${st.bar}`}
                            style={{ width: `${p.progress?.percent || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {p.budgetLabel || money(p.budget)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="p-2 text-primary min-w-[40px] min-h-[40px]"
                          onClick={() =>
                            router.push(`/profile/project-manage/reports/${p._id}`)
                          }
                          aria-label="View report"
                        >
                          <FaEye />
                        </button>
                        <button
                          type="button"
                          className="p-2 text-sky-600 min-w-[40px] min-h-[40px]"
                          onClick={() =>
                            router.push(`/profile/project-manage/${p._id}`)
                          }
                          aria-label="Manage project"
                        >
                          <FaTasks />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {pagination.totalPage > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            current={page}
            pageSize={10}
            total={pagination.totalData || 0}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
