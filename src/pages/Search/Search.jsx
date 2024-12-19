import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Search.css";
import FooterSection from "../../components/Sections/FooterSection";
import ProductSearch from "../../components/ProductSearch/ProductSearch";
import { useEffect } from "react";
const Search = () => {
  useEffect(() => {
    // Scroll to the top of the page when the component mounts
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <Navbar />

      <div style={{ boxShadow: "none" }}>
        <ProductSearch />
      </div>
      <div className="footer-prod">
        <FooterSection />
      </div>
    </div>
  );
};

export default Search;
