"use client";

import { Button, Input, Pagination, Select, Spin, message } from "antd";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { getImageUrl } from "../../../lib/getImageUrl";
import {
  useAcceptOfferMutation,
  usePendingBidsQuery,
} from "../../../redux/features/projects/projectApi";

const { Search } = Input;

export default function MyBids() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [acceptingId, setAcceptingId] = useState(null);

  const { data, isLoading, refetch } = usePendingBidsQuery({ page, limit: 50 });
  const [acceptOffer] = useAcceptOfferMutation();
  const myProject = data?.data?.pendingsBits || [];

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    let list = myProject.filter((p) => {
      if (!q) return true;
      const hay = [
        p?.projectId?.projectCategory,
        p?.projectId?.projectName,
        p?.projectId?.postCode,
        p?.projectId?.city,
        p?.projectId?.street,
        String(p?.price ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      return new Date(b.startTime || 0) - new Date(a.startTime || 0);
    });
    return list;
  }, [myProject, searchText, sortBy]);

  const handleAccept = async (bitId, conversationId) => {
    try {
      setAcceptingId(bitId);
      const res = await acceptOffer(bitId).unwrap();
      message.success("Offer accepted — project is active");
      refetch();
      const cid = res?.data?.conversationId || conversationId;
      const projectId = res?.data?.project?._id;
      if (projectId) {
        router.push(`/profile/project-details-message?projectId=${projectId}`);
      } else if (cid) {
        router.push(`/profile/inbox/${cid}`);
      }
    } catch (err) {
      message.error(
        err?.data?.message || err?.message || "Could not accept offer"
      );
    } finally {
      setAcceptingId(null);
    }
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
          My Pending Bids
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Open marketplace bids and direct offers from clients appear here.
        </p>
      </div>

      <div className="px-4 mt-4 flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto sm:mx-0">
        <Search
          allowClear
          size="large"
          placeholder="Search category, city, post code, price…"
          prefix={<FaSearch className="text-hash" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={setSearchText}
          className="flex-1"
        />
        <Select
          size="large"
          className="w-full sm:w-44"
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "price-asc", label: "Price: low → high" },
            { value: "price-desc", label: "Price: high → low" },
          ]}
        />
      </div>

      <div className="py-6">
        {filtered.length === 0 ? (
          <p className="text-center text-base font-medium my-16 px-4 text-gray-600">
            {myProject.length === 0 ? (
              <>
                No bid projects found.{" "}
                <Link href="/projects" className="text-primary underline font-semibold">
                  Browse projects
                </Link>
              </>
            ) : (
              "No bids match your search."
            )}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-4">
            {filtered.map((project) => {
              const isDirect = !!project?.projectId?.isDirected;
              return (
                <div
                  key={project._id}
                  className="bg-white border border-hash/25 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition"
                >
                  <div className="relative w-full h-44 bg-secondary">
                    {project?.projectId?.image &&
                    project.projectId.image !== "directed-offer" ? (
                      <Image
                        src={getImageUrl(project?.projectId?.image)}
                        alt={project.projectId?.projectCategory || "bid"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-primary font-semibold">
                        {isDirect ? "Direct offer" : "Project"}
                      </div>
                    )}
                    <span className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-full bg-secondary text-primary border border-primary/20">
                      {isDirect ? "Direct offer" : "Pending"}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold mb-2">
                      {project?.projectId?.projectName ||
                        project?.projectId?.projectCategory}
                    </h3>
                    <p className="text-sm text-primary font-semibold">
                      <span className="text-gray-700 font-medium">Price:</span> $
                      {project.price}
                    </p>
                    <p className="text-sm text-gray-600">
                      Post code: {project.projectId?.postCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      Start:{" "}
                      {project?.startTime
                        ? format(new Date(project.startTime), "dd MMM yyyy")
                        : "—"}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Service: {project.serviceTime} Days
                    </p>
                    {isDirect && (
                      <div className="mt-auto flex flex-col gap-2">
                        <Button
                          type="primary"
                          className="bg-primary"
                          loading={acceptingId === project._id}
                          onClick={() =>
                            handleAccept(
                              project._id,
                              project.projectId?.sourceConversationId
                            )
                          }
                        >
                          Accept offer
                        </Button>
                        {project.projectId?.sourceConversationId && (
                          <Button
                            onClick={() =>
                              router.push(
                                `/profile/inbox/${project.projectId.sourceConversationId}`
                              )
                            }
                          >
                            Open chat
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-center pb-4">
        <Pagination
          showQuickJumper
          current={page}
          onChange={setPage}
          total={data?.data?.pagination?.totalData || filtered.length}
          pageSize={10}
        />
      </div>
    </div>
  );
}
