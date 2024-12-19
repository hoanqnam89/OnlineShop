import React from "react";
import { Link } from "react-router-dom";

const Help = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-semibold text-gray-800">
        Chức năng này đang trong quá trình phát triển
      </h1>
      <p className="text-gray-600 mt-4">Vui lòng quay lại sau!</p>
      <Link
        to="/"
        className="mt-6 px-6 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition duration-300"
      >
        Quay lại Trang Chủ
      </Link>
    </div>
  );
};

export default Help;
