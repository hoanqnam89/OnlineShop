import React from "react";
import "./Loading.css";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative flex justify-center items-center">
        {/* Outer circle */}
        <div className="absolute animate-spin-slow rounded-full h-24 w-24 border-t-4 border-r-4 border-green-500"></div>
        <div className="absolute animate-spin-reverse-slow rounded-full h-20 w-20 border-b-4 border-l-4 border-blue-500"></div>
      </div>
    </div>
  );
};

export default Loading;
