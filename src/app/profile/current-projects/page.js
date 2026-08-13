"use client";

import { Input, Pagination, Select, Spin } from "antd";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { getImageUrl } from "../../../lib/getImageUrl";
import { useCurrentProjectsQuery } from "../../../redux/features/projects/projectApi";

const { Search } = Input;

export default function CurrentProjects() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useCurrentProjectsQuery({ page, limit: 50 });
  const myProject = data?.data?.currentProjects || [];

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return myProject.filter((p) => {
      if (statusFilter && String(p.isComplete) !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        p?.projectId?.projectCategory,
        p?.projectId?.projectName,
        p?.projectId?.street,
        p?.projectId?.postCode,
        p?.projectId?.city,
        p?.Workdetails,
        String(p?.price ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [myProject, searchText, statusFilter]);

  const handleOpenProject = (project) => {
    router.push(
      `/profile/project-details-message?projectId=${project?.projectId?._id}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-secondary/60 to-white pb-24 md:pb-8">
      <div className="px-4 pt-4 text-center sm:text-left">
        <p className="text-[11px] uppercase tracking-wider text-hash">Dashboard</p>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">
          Current Projects
        </h1>
      </div>

      <div className="px-4 mt-4 flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto sm:mx-0">
        <Search
          allowClear
          size="large"
          placeholder="Search category, street, post code…"
          prefix={<FaSearch className="text-hash" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={setSearchText}
          className="flex-1"
        />
        <Select
          allowClear
          size="large"
          placeholder="Filter status"
          className="w-full sm:w-44"
          value={statusFilter || undefined}
          onChange={(v) => setStatusFilter(v || "")}
          options={[
            { value: "running", label: "Running" },
            { value: "complete", label: "Done request" },
          ]}
        />
      </div>

      <div className="py-6">
        {filtered.length === 0 ? (
          <p className="text-center text-base font-medium my-16 px-4 text-gray-600">
            {myProject.length === 0
              ? "After approval, you can see your current project."
              : "No projects match your search or filter."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-4">
            {filtered.map((project) => (
              <div
                key={project._id}
                className="bg-white border border-hash/25 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition"
              >
                <div className="relative w-full h-44">
                  <Image
                    src={getImageUrl(project?.projectId?.image)}
                    alt={project?.projectId?.projectCategory || "project"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold mb-2">
                    {project.projectId?.projectCategory}
                  </h3>
                  <p className="text-sm text-primary font-semibold">
                    <span className="text-gray-700 font-medium">Price:</span> $
                    {project.price}
                  </p>
                  <p className="text-sm text-gray-600">
                    {project.projectId?.street} · {project.projectId?.postCode}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {project?.startTime
                      ? format(new Date(project.startTime), "dd MMM yyyy")
                      : "—"}{" "}
                    · {project.serviceTime} Days
                  </p>
                  {project.Workdetails && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {project.Workdetails}
                    </p>
                  )}
                  <div className="mt-auto flex justify-center">
                    <button
                      onClick={() => handleOpenProject(project)}
                      className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-[#4d7f24] transition"
                    >
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center pb-4">
          <Pagination
            showQuickJumper
            showSizeChanger={false}
            total={data?.data?.pagination?.totalData || 0}
            current={page}
            onChange={setPage}
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
