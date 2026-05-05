"use client";

import { Pagination, Spin } from "antd"; // Import Pagination from antd
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCurrentProjectsQuery } from "../../../redux/features/projects/projectApi";

export default function CurrentProjects() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  // Destructure the pagination data and currentProjects from the response
  const { data, isLoading } = useCurrentProjectsQuery({ page });
  const myProject = data?.data?.currentProjects || [];

  const handleOpenProject = (project) => {
    router.push(
      `/profile/project-details-message?projectId=${project?.projectId?._id}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen">
        <Spin size="large" />
      </div>
    );
  }
  return (
    <>
      <div className="text-primary text-2xl text-center font-bold my-2">
        Current Projects
      </div>
      <div className="py-8">
        {myProject?.length === 0 ? (
          <p className="min-h-screen w-full text-center text-xl font-semibold my-20">
            After approval, you can see your current project.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
            {myProject?.map((project) => (
              <div
                key={project._id}
                className="bg-secondary p-4 rounded-lg overflow-hidden shadow-md flex flex-col hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative w-full h-48 mb-4 rounded-t-lg overflow-hidden">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${project?.projectId?.image}`}
                    alt={project.title}
                    fill
                    className="rounded-t-lg object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2">
                    {project.projectId.projectCategory}
                  </h3>
                  <p className="text-primary font-bold mb-1">
                    <span className="font-semibold text-black ">Price:</span> $
                    {project.price}
                  </p>
                  <p className="text-primary font-bold mb-4">
                    <span className="font-semibold text-black "> Date:</span>{" "}
                    {format(new Date(project?.startTime), "dd MMM yyyy")}
                  </p>

                  <p className="text-primary font-bold mb-1">
                    <span className="font-semibold text-black ">Street:</span>{" "}
                    {project.projectId.street}
                  </p>
                  <p className="text-primary font-bold mb-1">
                    <span className="font-semibold text-black ">
                      Post Code:
                    </span>{" "}
                    {project.projectId.postCode}
                  </p>

                  <p className="text-primary font-bold mb-4">
                    <span className="font-semibold text-black ">Time:</span>{" "}
                    {project.serviceTime} Days
                  </p>
                  <p className="text-black mb-4">{project.Workdetails}</p>

                  <div className="flex justify-center">
                    <button
                      onClick={() => handleOpenProject(project)}
                      className="bg-primary/80 text-white px-4 py-2 rounded hover:bg-primary transition-colors duration-300"
                    >
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* pagination */}
        <div className=" flex justify-center pb-20 md:p-4">
          <Pagination
            defaultCurrent={1}
            position={["bottomCenter"]}
            showQuickJumper={true}
            showSizeChanger={false}
            total={data?.data?.pagination?.totalData || 0}
            current={page}
            onChange={(currentPage) => setPage(currentPage)}
            pageSize={10}
          />
        </div>
      </div>
    </>
  );
}
