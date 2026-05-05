"use client";

import { Button } from "antd";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { SuccessSwal } from "../../../../components/utils/allSwalFire";
import {
  useMyProjectBitDetailsQuery,
  useProjectApprovedMutation,
} from "../../../../redux/features/projects/projectApi";

export default function Payment(props) {
  const { approvdProjectId } = props.searchParams;
  const router = useRouter();

  const { data } = useMyProjectBitDetailsQuery(approvdProjectId);
  const bid = data?.data;

  const [approved, { isLoading }] = useProjectApprovedMutation();

  const formattedStartDate = bid?.startDate
    ? format(new Date(bid?.startDate), "dd MMM yyyy")
    : "N/A";

  const handlePayment = async (id) => {
    console.log(id);
    try {
      await approved(id).unwrap();

      SuccessSwal({
        title: "",
        text: " Payment Successfull! ",
      });
      router.push("/profile/my-projects");
      // if (response?.statusCode === 510) {
      //   router.push(`/profile/wallet`);
      // }
      // router.push(`/profile/project-details-message`);
    } catch (error) {
      console.log(error?.data);
      const statusCode = error?.data?.statusCode;

      if (statusCode === 409) {
        Swal.fire({
          text:
            error?.message || error?.data?.message || "something went wrong",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Go My Projects",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/profile/my-projects");
          }
        });
      }

      if (statusCode === 510) {
        Swal.fire({
          text:
            error?.message || error?.data?.message || "something went wrong",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Go Wallet",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/profile/wallet");
          }
        });
      }
    }
  };

  return (
    <div className=" flex flex-col justify-center items-center">
      <h1 className="text-3xl font-semibold text-primary mb-4">Payment</h1>
      <p className="text-gray-600 mb-6 text-center">
        Pay Now to confirm your project. <br /> Don’t worry it will be safe in
        admin hands until the project is done.
      </p>
      <div className="bg-green-50 rounded-lg shadow-md p-6 w-full max-w-sm">
        {/* Project Info */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Project : </p>
            <p className="text-primary font-bold"> {bid?.projectType} </p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="font-semibold">Starting Date : </p>
            <p className="text-primary font-bold">{formattedStartDate}</p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="font-semibold">Service Time :</p>
            <p className="text-primary font-bold"> {bid?.serviceTime} days </p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="font-semibold">Price : </p>
            <p className="text-primary font-bold">$ {bid?.price} </p>
          </div>
        </div>
        {/* Pay Now Button */}

        <Button
          type="primary"
          loading={isLoading}
          className=" w-full"
          onClick={() => handlePayment(approvdProjectId)}
        >
          {" "}
          Pay Now{" "}
        </Button>
      </div>
    </div>
  );
}
