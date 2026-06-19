"use client";

import { Card, Rate } from "antd";
import dayjs from "dayjs";
import Image from "next/image";
import { getImageUrl } from "../../lib/getImageUrl";
import { useTopReviewsQuery } from "../../redux/features/review/reviewApi";

export default function TopReviews({ providerID }) {
  const { data } = useTopReviewsQuery(providerID);
  const reviews = data?.data;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Top Reviews</h2>
      {reviews?.map((review) => {
        const ratingValue = parseFloat(review.rating) || 0;
        const formattedDate = dayjs(review.createdAt).format("MMM DD, YYYY");

        return (
          <Card
            key={review._id}
            className="mb-4 shadow-sm rounded-md"
            bodyStyle={{ padding: "16px" }}
          >
            <div className="flex justify-between items-start gap-8">
              <div className="flex items-center space-x-4">
                {/* Avatar Container */}
                <div className="relative w-12 h-12">
                  <Image
                    src={getImageUrl(review?.image)}
                    alt="User"
                    fill
                    className="rounded-full object-cover"
                    sizes="(max-width: 768px) 100vw,
                           (max-width: 1200px) 50vw,
                           33vw"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-lg">Gazi</span>
                    <Rate disabled defaultValue={ratingValue} />
                    <span className="text-gray-500">
                      {ratingValue.toFixed(1)}/5.0
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-gray-500 text-sm">{formattedDate}</div>
            </div>

            <p className="mt-4 text-gray-700">{review.details}</p>
            {/* <span className="text-blue-600 cursor-pointer">See More</span> */}
          </Card>
        );
      })}
    </div>
  );
}
