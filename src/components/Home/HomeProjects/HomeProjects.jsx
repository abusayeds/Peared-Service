"use client";

import { Spin } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { getImageUrl } from "../../../lib/getImageUrl";
import { useAllProjectsQuery } from "../../../redux/features/projects/projectApi";

export default function HomeProjects({
  title = "All Projects",
  limit = 8,
}) {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading } = useAllProjectsQuery({
    page: 1,
    limit,
  });

  const projects = data?.data?.project ?? [];

  const handleBid = (projectId) => {
    if (!user) {
      router.push(`/login?redirect=/projects`);
      return;
    }
    if (user.role === "provider") {
      router.push("/projects");
      return;
    }
    router.push("/login");
  };

  return (
    <section className="w-full py-8 md:py-12 bg-gradient-to-b from-secondary/40 to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-hash">
              Marketplace
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-primary">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Open jobs available for providers to bid on
            </p>
          </div>
          <Link
            href="/projects"
            className="text-sm font-semibold text-primary underline hover:text-[#4d7f24]"
          >
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {projects.slice(0, limit).map((project) => (
              <div
                key={project._id}
                className="bg-white border border-hash/25 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition flex flex-col"
              >
                <div className="relative w-full h-40 bg-secondary">
                  <Image
                    src={getImageUrl(project.image)}
                    alt={project.projectName || "project"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 truncate">
                    {project.projectName || project.projectCategory}
                  </h3>
                  <p className="text-xs text-primary font-semibold mt-1">
                    {project.projectCategory}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium text-gray-800">Budget:</span>{" "}
                    {project.priceRange}
                  </p>
                  <p className="text-sm text-gray-600">
                    {project.city}
                    {project.postCode ? ` · ${project.postCode}` : ""}
                  </p>
                  <div className="mt-auto pt-4 flex gap-2">
                    <Link
                      href="/projects"
                      className="flex-1 text-center text-sm py-2 rounded-lg border border-primary text-primary hover:bg-primary/5"
                    >
                      Details
                    </Link>
                    {(user?.role === "provider" || !user) && (
                      <button
                        type="button"
                        onClick={() => handleBid(project._id)}
                        className="flex-1 text-sm py-2 rounded-lg bg-primary text-white hover:bg-[#4d7f24]"
                      >
                        Bid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
