"use client";

import { Button, Input, Pagination, Select, Spin } from "antd";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";
import { SuccessSwal } from "../../../components/utils/allSwalFire";
import { getImageUrl } from "../../../lib/getImageUrl";
import {
  useBoostProjectMutation,
  useMyProjectsQuery,
} from "../../../redux/features/projects/projectApi";

const { Search } = Input;

function getStatus(project) {
  if (project?.isComplete === true) return "completed";
  if (project?.isApprove) return "running";
  return "open";
}

export default function MyProjects() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useMyProjectsQuery({ page, limit: 50 });
  const [boostProject] = useBoostProjectMutation();

  const projects = data?.data?.projects || [];

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return projects.filter((p) => {
      const status = getStatus(p);
      if (statusFilter && status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        p.projectName,
        p.projectCategory,
        p.city,
        p.postCode,
        p.street,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [projects, searchText, statusFilter]);

  const handleOpenProject = (project) => {
    router.push(`/profile/my-projects/bid-lists?projectId=${project._id}`);
  };
  const handleEditProject = (project) => {
    router.push(`/profile/my-projects/${project._id}`);
  };
  const handleGoToMessage = (project) => {
    router.push(`/profile/project-details-message?projectId=${project._id}`);
  };
  const handleBoostProject = async (id) => {
    const response = await boostProject(id).unwrap();
    SuccessSwal({ title: "", text: response?.message });
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
      <div className="px-4 pt-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-gray-600 hover:bg-primary/10 hover:text-primary"
          aria-label="Go Back"
        >
          <FaArrowLeft size={18} />
        </button>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-hash">Dashboard</p>
          <h1 className="text-xl sm:text-2xl font-bold text-primary leading-tight">
            My Projects
          </h1>
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col sm:flex-row gap-3 max-w-3xl">
        <Search
          allowClear
          size="large"
          placeholder="Search name, category, city, post code…"
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
            { value: "open", label: "Open / Bids" },
            { value: "running", label: "In progress" },
            { value: "completed", label: "Completed" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-base font-medium my-16 px-4 text-gray-600">
          {projects.length === 0 ? (
            <>
              Please add your{" "}
              <Link href="/" className="text-primary underline font-semibold">
                project
              </Link>
              .
            </>
          ) : (
            "No projects match your search or filter."
          )}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-4">
          {filtered.map((project) => {
            const status = getStatus(project);
            return (
              <div
                key={project._id}
                className="bg-white border border-hash/25 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition"
              >
                <div className="relative w-full h-44">
                  <Image
                    src={getImageUrl(project?.image)}
                    alt={project.projectName || "project"}
                    fill
                    className="object-cover"
                  />
                  <span
                    className={`absolute top-2 right-2 text-[11px] font-semibold px-2 py-1 rounded-full ${
                      status === "completed"
                        ? "bg-primary text-white"
                        : status === "running"
                          ? "bg-secondary text-primary border border-primary/30"
                          : "bg-white/95 text-gray-700"
                    }`}
                  >
                    {status === "completed"
                      ? "Completed"
                      : status === "running"
                        ? "In progress"
                        : "Open"}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    {project.projectCategory}
                  </h3>
                  <p className="text-sm text-primary font-semibold">
                    <span className="text-gray-700 font-medium">Price:</span> $
                    {project.priceRange}
                  </p>
                  <p className="text-sm text-gray-600">
                    {project.city} · {project.postCode}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {format(new Date(project?.createdAt), "dd MMM yyyy")}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2">
                    {status === "completed" ? (
                      <span className="text-sm text-primary font-semibold inline-flex items-center gap-1">
                        Completed <MdOutlineVerified />
                      </span>
                    ) : (
                      <Button
                        type="primary"
                        className="!bg-primary"
                        onClick={
                          project?.isApprove === false && project?.payment === false
                            ? () => handleBoostProject(project._id)
                            : project?.isApprove
                              ? () => handleGoToMessage(project)
                              : () => handleOpenProject(project)
                        }
                      >
                        {project?.isApprove === false && project?.payment === false
                          ? "Boost"
                          : project?.isApprove
                            ? "Message"
                            : "Open"}
                      </Button>
                    )}
                    {project?.isApprove === false && (
                      <Button onClick={() => handleEditProject(project)}>
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
  );
}
