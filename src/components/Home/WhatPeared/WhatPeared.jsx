import Image from "next/image";
import Link from "next/link";
import right_img1 from "../../../assets/home/whatPeared/right_img1.png";
import right_img2 from "../../../assets/home/whatPeared/right_img2.png";
import right_img3 from "../../../assets/home/whatPeared/right_img3.png";
import left_img from "../../../assets/home/whatPeared/whatPeared_left_img.png";
import right_img from "../../../assets/home/whatPeared/whatPeared_right-img.png";
import CustomButton from "../../utils/CustomButton";

export default function WhatPeared() {
  return (
    <>
      <div className="hidden md:block bg-secondary py-20">
        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center items-center ">
          <div>
            <Image src={left_img} alt="left_img" />
          </div>
          <div className="py-4 lg:pr-20 space-y-8">
            <h3 className="font-bold text-3xl md:text-4xl lg:text-5xl text-primary">
              What is Peared?
            </h3>
            <p className="text-black">
              Peared is a one stop shop for customers to pear up with
              professionals in their area for any project. Our platform offers
              project and payment security for both customers and contractors. 
            </p>
            <div>
              <Link href={`/about-us`}>
                <CustomButton> Learn More </CustomButton>
              </Link>
            </div>
          </div>
          <div
            className="relative p-8 bg-no-repeat bg-cover bg-center "
            style={{
              backgroundImage: `url(${right_img.src})`,
            }}
          >
            <Image className="lg:ml-4" src={right_img1} alt="right_img" />
            <Image
              className="absolute top-52 -right-0 lg:top-52 lg:right-8 z-10"
              src={right_img2}
              alt="right_img"
            />
            <Image
              className="absolute top-12 -right-0 lg:top-16 lg:right-16 z-20"
              src={right_img3}
              alt="right_img"
            />
          </div>
        </div>
      </div>
    </>
  );
}
