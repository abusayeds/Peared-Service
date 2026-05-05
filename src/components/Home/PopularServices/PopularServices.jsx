import Image from "next/image";
import SERVICE1 from "../../../assets/home/services/service_1.png";
import SERVICE2 from "../../../assets/home/services/service_2.png";
import SERVICE3 from "../../../assets/home/services/service_3.png";
import SERVICE4 from "../../../assets/home/services/service_4.png";
import SERVICE5 from "../../../assets/home/services/service_5.png";

const services = [
  {
    _id: 1,
    name: "Residential Cleaning",
    logo: SERVICE1,
  },
  {
    _id: 2,
    name: "Commercial Cleaning",
    logo: SERVICE2,
  },
  {
    _id: 3,
    name: "Painting",
    logo: SERVICE3,
  },
  {
    _id: 4,
    name: "Landscaping",
    logo: SERVICE4,
  },
  {
    _id: 5,
    name: "Carpentry",
    logo: SERVICE5,
  },
];

export default function PopularServices() {
  return (
    <>
      <div className="container hidden md:block mx-auto py-20">
        <h2 className="text-2xl lg:text-4xl font-bold text-center text-primary mb-10">
          Our Popular Services
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {services.map((service) => (
            // <Link
            //   href={`/`}
            //   key={service._id}
            //   className="flex flex-col justify-center items-center gap-8 shadow-xl p-8 rounded-lg bg-secondary/50"
            // >
            //   <Image src={service.logo} alt="logo" width={100} height={100} />
            //   <p className="text-sm">{service.name}</p>
            // </Link>
            <div
              key={service._id}
              className="p-8 flex flex-col justify-center items-center gap-8 bg-secondary rounded-lg border shadow-sm"
            >
              <Image src={service?.logo} alt="logo" width={80} height={80} />
              <p className="text-md italic">{service?.name}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
