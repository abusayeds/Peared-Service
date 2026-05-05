"use client";

import Image from "next/image";
import { useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaRegStar,
  FaStar,
  FaStarHalfAlt,
} from "react-icons/fa";
import image1 from "../../../assets/home/feedback/image1.png";
import image2 from "../../../assets/home/feedback/image2.png";
import image3 from "../../../assets/home/feedback/image3.png";
import image4 from "../../../assets/home/feedback/image4.png";
import quotation_img from "../../../assets/home/feedback/quotation_img.png";
import CustomHeading from "../../utils/CustomHeading";

const Feedback = () => {
  const Feedback = [
    {
      _id: "1",
      name: "Jane Doe",
      designation: "Product Manager",
      rating: 5,
      description:
        "Peared has transformed the way our team collaborates. Their solutions are intuitive and highly effective.",
      image: image1,
      logo: "/images/company-logo.png",
    },
    {
      _id: "2",
      name: "John Smith",
      designation: "Senior Developer",
      rating: 4.5,
      description:
        "The support from Peared is exceptional. They helped us integrate their tools seamlessly into our workflow.",
      image: image2,
      logo: "/images/company-logo.png",
    },
    {
      _id: "3",
      name: "Emily Johnson",
      designation: "UX Designer",
      rating: 4,
      description:
        "Peared's platform is user-friendly and customizable. It has significantly improved our design processes.",
      image: image3,
      logo: "/images/company-logo.png",
    },
    {
      _id: "4",
      name: "Tony Alfasa",
      designation: " QA Engineer ",
      rating: 4.2,
      description:
        "Peared's platform is user-friendly and customizable. It has significantly improved our design processes.",
      image: image4,
      logo: "/images/company-logo.png",
    },
    // Add more Feedback as needed
  ];

  const [current, setCurrent] = useState(0);
  const length = Feedback.length;

  const nextSlide = () => {
    setCurrent(current === length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? length - 1 : current - 1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={`full-${i}`} className="text-yellow-400 inline" />
      );
    }

    if (halfStar) {
      stars.push(
        <FaStarHalfAlt key="half" className="text-yellow-400 inline" />
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar key={`empty-${i}`} className="text-yellow-400 inline" />
      );
    }

    return stars;
  };

  return (
    <section className="hidden md:block py-12 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-col-1 md:grid-cols-2 gap-8 lg:px-44">
          {/* Left Side */}
          <div className="">
            <CustomHeading>
              {" "}
              Feedback About Their Experience With Us{" "}
            </CustomHeading>
            <p className="my-6 text-black">
              Read testimonials from our satisfied clients. See how our cleaning
              services have made a difference in their lives and homes
            </p>
            <div className="flex space-x-4">
              <button
                onClick={prevSlide}
                aria-label="Previous Testimonial"
                className="px-4 py-2 bg-white text-primary rounded-lg shadow hover:bg-primary hover:text-white border border-primary"
              >
                <FaArrowLeft size={30} />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next Testimonial"
                className="px-4 bg-primary text-white rounded-lg shadow hover:bg-white hover:text-primary border border-primary"
              >
                <FaArrowRight size={30} />
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="rounded rounded-t-2xl rounded-r-2xl bg-white shadow-lg  border border-t-primary border-t-8 border-r-primary border-r-8">
            {Feedback.map((testimonial, index) => (
              <div
                className={index === current ? "opacity-100" : "opacity-0"}
                key={testimonial._id}
              >
                {index === current && (
                  <div className="p-6 rounded-lg  relative">
                    {/* Logo */}
                    <Image
                      className="absolute top-4 right-4 w-16 h-16 object-contain"
                      src={quotation_img}
                      alt="quotation_img"
                      width={1000}
                      height={1000}
                    />

                    {/* Image */}
                    <div className="flex items-center mb-4">
                      <Image
                        width={1000}
                        height={1000}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                        src={testimonial.image}
                        alt={testimonial.name}
                      />

                      <div>
                        <h3 className="text-xl font-semibold">
                          {testimonial.name}
                        </h3>
                        <p className="text-gray-500">
                          {testimonial.designation}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-4">
                      {renderStars(testimonial.rating)}
                    </div>

                    {/* Description */}
                    <p className="text-gray-700">{testimonial.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feedback;
