"use client";

import { Input, Pagination, Rate, Spin } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import default_img from "../../../assets/user_img_default.png";
import { getImageUrl } from "../../../lib/getImageUrl";
import {
  usePublicProvidersQuery,
  useSearchServicesQuery,
} from "../../../redux/features/catalog/catalogApi";
import CatalogSelect from "../../utils/CatalogSelect";

const { Search } = Input;

export default function AllProviders({
  title = "All Providers",
  limit = 8,
  showFilters = true,
  showPagination = true,
  compact = false,
}) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [service, setService] = useState("");

  const { data, isLoading, isFetching } = usePublicProvidersQuery({
    page,
    limit,
    searchTerm: searchTerm || undefined,
    service: service || undefined,
  });

  // warm catalog cache
  useSearchServicesQuery({ q: "", limit: 20 });

  const providers = data?.data?.providers || [];
  const pagination = data?.data?.pagination;

  return (
    <section className={`w-full ${compact ? "py-8" : "py-12 md:py-16"} bg-white`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-hash">
              Talent
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-primary">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Browse verified providers, services, ratings and completed jobs
            </p>
          </div>
          <Link
            href="/providers"
            className="text-sm font-semibold text-primary underline hover:text-[#4d7f24]"
          >
            View all
          </Link>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-3xl">
            <Search
              allowClear
              size="large"
              placeholder="Search providers, city, service…"
              prefix={<FaSearch className="text-hash" />}
              onSearch={(v) => {
                setPage(1);
                setSearchTerm(v || "");
              }}
              className="flex-1"
            />
            <div className="w-full sm:w-56">
              <CatalogSelect
                type="service"
                mode="single"
                placeholder="Filter by service"
                value={service}
                onChange={(v) => {
                  setPage(1);
                  setService(v || "");
                }}
              />
            </div>
          </div>
        )}

        {isLoading || isFetching ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : providers.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No providers found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {providers.map((p) => (
              <Link
                key={p._id}
                href={`/providers/${p._id}`}
                className="group bg-secondary/40 border border-hash/25 rounded-2xl p-4 hover:shadow-md hover:border-primary/40 transition"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={getImageUrl(p.image, default_img.src)}
                    alt={p.name}
                    width={56}
                    height={56}
                    className="rounded-full h-14 w-14 object-cover border-2 border-primary/30"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-primary">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                      <FaMapMarkerAlt className="text-primary shrink-0" />
                      {p.city || "Location N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Rate
                    disabled
                    allowHalf
                    value={p.averageRating || 0}
                    className="text-sm [&_.ant-rate-star]:me-0.5"
                  />
                  <span className="text-xs text-gray-500">
                    {p.ratingCount || 0} reviews
                  </span>
                </div>

                <p className="mt-2 text-xs text-primary font-semibold">
                  {p.completedJobs || 0} jobs completed
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(p.service || []).slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-hash/30 text-gray-700"
                    >
                      {s}
                    </span>
                  ))}
                  {(p.service || []).length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      +{p.service.length - 3}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {showPagination && pagination?.totalPage > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              current={page}
              total={pagination.totalData}
              pageSize={limit}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </section>
  );
}
