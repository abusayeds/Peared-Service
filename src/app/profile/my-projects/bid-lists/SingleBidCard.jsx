import { format } from "date-fns";
import { FaStar } from "react-icons/fa";

export default function SingleBidCard({ bid, handleProviderDetails }) {
  const rating = Math.round(parseFloat(bid.averageRating));

  return (
    <div className="border border-gray-300 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 shadow-lg w-full max-w-sm sm:max-w-md md:max-w-full mx-auto">
      <div className="text-gray-900 font-semibold text-lg">
        <p>
          <span className="font-extrabold text-black">Provider ID:</span> #
          {bid.providerId.slice(0, 7)}...
        </p>
        <div className="flex items-center mt-2">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={i < rating ? "text-yellow-500" : "text-gray-300"}
            />
          ))}
          <span className="ml-2 text-gray-700 text-sm">
            ({bid.averageRating}/5)
          </span>
        </div>
        <p className="text-sm font-semibold text-black">
          Reviews:{" "}
          <span className="font-bold text-primary"> {bid.totalRating} </span>
        </p>
      </div>

      <div className="mt-4 text-gray-900">
        <p className=" font-semibold text-black">
          Price:
          <span className=" text-primary font-bold "> $ {bid.price}</span>
        </p>
        <p className=" font-semibold text-black">
          Service Time:
          <span className=" text-primary font-bold ">
            {bid.serviceTime} days
          </span>{" "}
        </p>
        <p className=" font-semibold text-black">
          Starting Date:
          <span className=" text-primary font-bold ">
            {" "}
            {format(new Date(bid.startTime), "dd MMM yyyy")}
          </span>{" "}
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => handleProviderDetails(bid?._id)}
          className="border border-green-500 text-black px-4 py-2 rounded-xl font-medium shadow-md hover:bg-green-200 transition w-full sm:w-auto"
        >
          See Details
        </button>
      </div>
    </div>
  );
}
