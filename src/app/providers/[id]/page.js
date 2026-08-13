"use client";

import { Button, Rate, Spin, Tag, message } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaArrowLeft, FaBriefcase, FaComments, FaMapMarkerAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import default_img from "../../../assets/user_img_default.png";
import BottomBar from "../../../components/BottomBar/BottomBar";
import { getImageUrl } from "../../../lib/getImageUrl";
import { usePublicProviderDetailsQuery } from "../../../redux/features/catalog/catalogApi";
import { useStartDirectChatMutation } from "../../../redux/features/chat/chatApi";

export default function ProviderPublicProfile() {
  const params = useParams();
  const router = useRouter();
  const providerId = params?.id;
  const { user } = useSelector((state) => state.auth);
  const [startChat, { isLoading: starting }] = useStartDirectChatMutation();

  useEffect(() => {
    if (user?.role === "provider") {
      router.replace("/projects");
    }
  }, [user, router]);

  const { data, isLoading } = usePublicProviderDetailsQuery(providerId, {
    skip: !providerId || user?.role === "provider",
  });

  const payload = data?.data;
  const provider = payload?.provider;

  const handleMessage = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "user") {
      message.info("Only clients can message providers");
      return;
    }
    try {
      const res = await startChat(providerId).unwrap();
      const conversationId = res?.data?._id;
      if (conversationId) {
        router.push(`/profile/inbox/${conversationId}`);
      }
    } catch (err) {
      message.error(err?.data?.message || err?.message || "Could not start chat");
    }
  };

  if (user?.role === "provider") return null;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <p className="text-gray-600">Provider not found.</p>
        <Link href="/providers" className="text-primary underline font-semibold">
          Back to providers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 to-white pb-24">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-4"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="bg-white border border-hash/25 rounded-2xl shadow-sm p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <Image
              src={getImageUrl(provider.image, default_img.src)}
              alt={provider.name}
              width={120}
              height={120}
              className="rounded-full h-28 w-28 object-cover border-4 border-primary/20"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {provider.name}
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <FaMapMarkerAlt className="text-primary" />
                {[provider.city, provider.postalCode, provider.address]
                  .filter(Boolean)
                  .join(" · ") || "Location not set"}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Rate disabled allowHalf value={payload.averageRating || 0} />
                  <span className="text-sm text-gray-600">
                    {payload.averageRating || 0} ({payload.ratingCount || 0})
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <FaBriefcase /> {payload.completedJobs || 0} jobs completed
                </span>
                {provider.verifiedSkillset && (
                  <Tag color="green">Verified skillset</Tag>
                )}
              </div>

              {provider.bio && (
                <p className="mt-4 text-gray-700 text-sm whitespace-pre-wrap">
                  {provider.bio}
                </p>
              )}

              <div className="mt-5">
                <Button
                  type="primary"
                  size="large"
                  icon={<FaComments />}
                  loading={starting}
                  onClick={handleMessage}
                  className="bg-primary"
                >
                  Message provider
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Chat first, agree on a price, then send an offer from the inbox.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="font-bold text-primary mb-2">Services</h2>
              <div className="flex flex-wrap gap-2">
                {(provider.service || []).length ? (
                  provider.service.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2.5 py-1 rounded-full bg-secondary border border-hash/30"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No services listed</p>
                )}
              </div>
            </div>
            <div>
              <h2 className="font-bold text-primary mb-2">Education</h2>
              <div className="flex flex-wrap gap-2">
                {(provider.education || []).length ? (
                  provider.education.map((e) => (
                    <span
                      key={e}
                      className="text-xs px-2.5 py-1 rounded-full bg-white border border-primary/30 text-primary"
                    >
                      {e}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No education listed</p>
                )}
              </div>
            </div>
          </div>

          {(payload.jobsByCategory || []).length > 0 && (
            <div className="mt-8">
              <h2 className="font-bold text-primary mb-3">Work by category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {payload.jobsByCategory.map((row) => (
                  <div
                    key={row.category}
                    className="rounded-xl bg-secondary/70 border border-hash/20 px-3 py-2"
                  >
                    <p className="text-xs text-gray-500 truncate">{row.category}</p>
                    <p className="text-lg font-bold text-primary">{row.count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-bold text-primary mb-3">Reviews</h2>
            {(payload.reviews || []).length === 0 ? (
              <p className="text-sm text-gray-500">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {payload.reviews.map((r) => (
                  <div
                    key={r._id}
                    className="rounded-xl border border-hash/20 bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-900">
                        {r.userId?.name || "Client"}
                      </p>
                      <Rate disabled value={r.rating} className="text-xs" />
                    </div>
                    {r.details && (
                      <p className="text-sm text-gray-600 mt-1">{r.details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomBar />
    </div>
  );
}
