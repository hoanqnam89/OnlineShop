import React, { useState } from "react";
import "../../Seller/SellerHomePage/SellerHomePage.css";
import Sidebar from "../component/Sidebar/Sidebar";
import Dashboard from "../component/Dashboard/Dashboard";
import ProductTable from "../component/ProductTable/ProductTable";
import AddProduct from "../component/AddProduct/AddProduct";
import UpdateProduct from "../component/UpdateProduct/UpdateProduct";
import OrderList from "../component/OrderList/OrderList";
import MultipleOrderList from "../component/OrderList/MultipleOrderList";

const SellerHomePage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productEdit, setProductEdit] = useState(null);

  return (
    <div className="flex h-screen">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-gray-800 fixed h-full">
        <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} />
      </div>

      {/* Scrollable right section */}
      <div className="ml-64 flex-1 overflow-y-scroll h-full">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "add-product" && <AddProduct />}
        {activeTab === "view-product" && (
          <ProductTable
            setActiveTab={setActiveTab}
            setProductEdit={setProductEdit}
          />
        )}
        {activeTab === "update-product" && productEdit && (
          <UpdateProduct product={productEdit} setActiveTab={setActiveTab} />
        )}

        {activeTab === "single-order" && <OrderList />}
        {activeTab === "multiple-orders" && <MultipleOrderList />}
      </div>
    </div>
  );
};

export default SellerHomePage;
