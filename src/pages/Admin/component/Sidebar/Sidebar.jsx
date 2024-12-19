import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-gray-800 text-white">
      <div className="p-4 text-lg font-bold">SELLER CENTER</div>
      <nav>
        <ul>
          <li
            className={`p-4 hover:bg-gray-700 cursor-pointer ${
              activeTab === "register-list" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActiveTab("register-list")}
          >
            Register List
          </li>
        </ul>
      </nav>
      {/* Back to Home Button */}
      <div
        className="absolute bottom-0 w-full p-4 text-center hover:bg-gray-700 cursor-pointer"
        onClick={() => navigate("/")}
      >
        Back to Home
      </div>
    </div>
  );
};

export default Sidebar;
