import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Products.css";
import Category from "../../components/Category/Category";
import FooterSection from "../../components/Sections/FooterSection";

const Products = () => {
  return (
    <div>
      <Navbar />
      <div className="product-header">
        <h1>Danh Sách Sản Phẩm</h1>
      </div>
      <div style={{ boxShadow: "none" }}>
        <Category />
      </div>
      <div className="footer-prod">
        <FooterSection />
      </div>
    </div>
  );
};

export default Products;
