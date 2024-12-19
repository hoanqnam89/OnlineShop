import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleProductsDropdown = () => {
    setIsProductsDropdownOpen(!isProductsDropdownOpen);
  };

  const toggleOrdersDropdown = () => {
    setIsOrdersDropdownOpen(!isOrdersDropdownOpen);
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white">
      <div className="p-4 text-lg font-bold">SELLER CENTER</div>
      <nav>
        <ul>
          <li
            className={`p-4 hover:bg-gray-700 cursor-pointer ${
              activeTab === "dashboard" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </li>

          {/* Products Section with Dropdown */}
          <li className="cursor-pointer">
            <div
              className={`p-4 flex justify-between items-center ${
                isProductsDropdownOpen ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
              onClick={toggleProductsDropdown}
            >
              <span>Products</span>
              <span>{isProductsDropdownOpen ? "▼" : "►"}</span>
            </div>

            {/* Dropdown for Products */}
            {isProductsDropdownOpen && (
              <ul className="ml-4 mt-2 space-y-2">
                <li
                  className={`p-2 pl-4 hover:bg-gray-700 cursor-pointer ${
                    activeTab === "add-product" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveTab("add-product")}
                >
                  Add Product
                </li>
                <li
                  className={`p-2 pl-4 hover:bg-gray-700 cursor-pointer ${
                    activeTab === "view-product" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveTab("view-product")}
                >
                  View Product
                </li>
              </ul>
            )}
          </li>

          {/* Orders Section with Dropdown */}
          <li className="cursor-pointer">
            <div
              className={`p-4 flex justify-between items-center ${
                isOrdersDropdownOpen ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
              onClick={toggleOrdersDropdown}
            >
              <span>Orders</span>
              <span>{isOrdersDropdownOpen ? "▼" : "►"}</span>
            </div>

            {/* Dropdown for Orders */}
            {isOrdersDropdownOpen && (
              <ul className="ml-4 mt-2 space-y-2">
                <li
                  className={`p-2 pl-4 hover:bg-gray-700 cursor-pointer ${
                    activeTab === "single-order" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveTab("single-order")}
                >
                  Single Order
                </li>
                <li
                  className={`p-2 pl-4 hover:bg-gray-700 cursor-pointer ${
                    activeTab === "multiple-orders" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveTab("multiple-orders")}
                >
                  Multiple Orders
                </li>
              </ul>
            )}
          </li>

          {/* <li
            className={`p-4 hover:bg-gray-700 cursor-pointer ${
              activeTab === "order-list" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActiveTab("order-list")}
          >
            Orders
          </li> */}
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
