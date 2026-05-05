"use client";

import { useRouter } from "next/navigation";
import { useMyProjectBitsQuery } from "../../../../redux/features/projects/projectApi";
import SingleBidCard from "./SingleBidCard";

export default function BidList(props) {
  const { projectId } = props.searchParams;
  const router = useRouter();

  const { data } = useMyProjectBitsQuery(projectId);

  const handleProviderDetails = (id) => {
    router.push(`/profile/my-projects/provider-details?bitProjectId=${id}`);
  };

  return (
    <>
      <div className="text-primary text-2xl text-center font-bold my-2">
        My Bids
      </div>
      <div>
        {!data?.data || data?.data?.length === 0 ? (
          <p className="text-red-500 min-h-screen w-full text-center text-lg md:text-xl font-semibold my-20">
            No one has bid on your project yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:px-6 md:px-12 p-4">
            {data?.data?.map((bid, index) => (
              <SingleBidCard
                bid={bid}
                key={index}
                handleProviderDetails={handleProviderDetails}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
