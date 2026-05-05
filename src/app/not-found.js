import Image from "next/image";
import Link from "next/link";
import notFoundImg from "../assets/error_img.png";

export default function NotFound() {
  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <div className="text-center ">
        <Image src={notFoundImg} alt="notFoundImg" />

        <p className="text-gray-700 mb-6">
          The page you are looking for might have been removed had its name
          <br />
          changed or is temporarily unavailable.
        </p>
        <div className="flex justify-center items-center gap-8">
          <Link href={`/`}>
            <button
              //   onClick={reset}
              className="px-4 py-2 bg-primary text-white rounded-full transition"
            >
              GO HOME
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
