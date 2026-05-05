"use client";

import { Spin } from "antd";
import { useGetAboutUsQuery } from "../../redux/features/settings/settingsApi";

export default function AboutUs() {
  const { data, isLoading } = useGetAboutUsQuery();
  console.log(data?.data);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div className="text-center bg-white shadow-xl min-h-screen p-4 md:p-8 lg:p-12 m-4 md:mx-8 lg:mx-16 xl:mx-32 md:my-8 lg:my-12">
        <div className="text-primary text-2xl text-center font-bold my-2">
          About Us
        </div>
        <div>
          {/* Render the HTML content from the API */}
          {data?.data[0]?.description ? (
            <>
              <div
                className="p-6 rounded-lg shadow-sm mb-8 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: data?.data[0]?.description }}
              />
            </>
          ) : (
            <>
              <h3 className="mt-12">About us not yet!!</h3>
            </>
          )}
        </div>
      </div>
    </>
  );
}
