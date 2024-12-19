import React from "react";
import { Link, useNavigate } from "react-router-dom";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState } from "react";
import { useEffect } from "react";
import { getTopSeller } from "../../api/userAPI";

const TopSellerSection = () => {
  const [sellers, setSellers] = useState([]);

  const navigate = useNavigate();
  const [startIndex, setStartIndex] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width]);

  useEffect(() => {
    const topSeller = async () => {
      try {
        const response = await getTopSeller();
        console.log("Top seller: ", response.data);
        setSellers(response.data);
      } catch (error) {
        console.log("Error fetching top seller: ", error);
      }
    };
    topSeller();
  }, []);

  const itemsPerPage = width > 1024 ? 7 : width > 768 ? 4 : 2; // Dynamically adjust based on width

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleNext = () => {
    if (startIndex < sellers.length - itemsPerPage) {
      setStartIndex(startIndex + 1);
    }
  };

  const handleTopSellerClick = (sellerId, sellerName) => {
    navigate("/product-seller-page", { state: { sellerId, sellerName } });
  };

  return (
    <div className="brand-section">
      <div style={{ padding: 20 }}>
        <div className="title-header">
          <h3 className="h3-title">Người Bán Nổi Bật</h3>
        </div>
        <div className="brand-container">
          <button
            className="arrow-btn left"
            onClick={handlePrev}
            disabled={startIndex === 0}
          >
            <KeyboardArrowLeftIcon />
          </button>
          <div className="brand-list">
            {sellers
              .slice(startIndex, startIndex + itemsPerPage)
              .map((seller) => (
                <div
                  key={seller._id}
                  onClick={() => handleTopSellerClick(seller._id, seller.name)}
                  className="brand-item"
                  style={{ cursor: "pointer" }}
                >
                  <img
                    className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 object-cover"
                    src={seller.avata}
                    alt={seller.name}
                  />
                </div>
              ))}
          </div>
          <button
            className="arrow-btn right"
            onClick={handleNext}
            disabled={startIndex >= sellers.length - itemsPerPage}
          >
            <KeyboardArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopSellerSection;
