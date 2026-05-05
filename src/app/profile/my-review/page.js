"use client";

import { Checkbox, Rate, Spin } from "antd";
import { format } from "date-fns";
import { FaStar } from "react-icons/fa";
import { ErrorSwal, SuccessSwal } from "../../../components/utils/allSwalFire";
import {
  useAddToFavouriteMutation,
  useMyReviewsQuery,
  useProviderAllReviewsQuery,
} from "../../../redux/features/review/reviewApi";

export default function MyReview() {
  const { data: myReviews, isLoading } = useMyReviewsQuery();
  const { data } = useProviderAllReviewsQuery();
  const allReviews = data?.data?.data;

  // console.log(allReviews);

  const [addFav] = useAddToFavouriteMutation();

  const handleFavouriteChange = async (reviewId, checked) => {
    try {
      console.log("Toggling review:", reviewId, "New status:", checked);

      const response = await addFav({
        reviewId: reviewId,
        isFavourite: checked,
      }).unwrap();
      console.log(response);

      SuccessSwal({
        title: "",
        text: response?.message,
      });
    } catch (error) {
      ErrorSwal({
        title: "",
        text: error?.data?.message || error?.message,
      });
    }
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
        My Review
      </div>
      <div className="max-w-4xl mx-auto p-4  overflow-x-hidden">
        {/* Ratings Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left md:gap-8 md:my-6">
          {/* Average Rating */}
          <div className="w-full md:w-1/2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Rate
                allowHalf
                value={parseFloat(myReviews?.data?.averageRating)}
                disabled
                className="text-yellow-500"
              />
              <span className="text-gray-700 font-bold text-lg">
                ({myReviews?.data?.averageRating}/5)
              </span>
            </div>
            <p className="font-semibold mt-2 text-gray-700">
              Total Reviews: ({myReviews?.data?.totalReviews})
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="w-full md:w-1/2">
            {[5, 4, 3, 2, 1].map((num) => (
              <div
                key={num}
                className="flex items-center justify-center md:justify-start gap-2 text-lg"
              >
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < num ? "text-yellow-500" : "text-gray-300"}
                  />
                ))}
                <span className="text-gray-800">
                  ({myReviews?.data?.ratingDistribution?.[num] || 0})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 mb-20">
          <h3 className="text-primary text-2xl  font-bold my-2">
            {" "}
            My All Reviews
          </h3>

          <p className="text-gray-600 mb-4">
            Select reviews you want to preview
          </p>

          <div className="space-y-4">
            {allReviews?.map((review) => (
              <div
                key={review._id}
                className="border rounded-lg p-4 flex items-start space-x-3 bg-white shadow-sm"
              >
                <Checkbox
                  checked={review?.isFavourite}
                  onChange={(e) =>
                    handleFavouriteChange(review._id, e.target.checked)
                  }
                />
                <div className="w-full">
                  <div className="flex flex-col  items-start mb-2">
                    <span className="font-bold text-gray-900">
                      {review?.userId?.name}
                    </span>
                    <span className="text-gray-500 text-xs pb-2">
                      {format(new Date(review?.createdAt), "dd MMM yyyy")}
                    </span>
                    <Rate
                      disabled
                      defaultValue={review?.rating}
                      className="text-yellow-500"
                    />
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {review?.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
