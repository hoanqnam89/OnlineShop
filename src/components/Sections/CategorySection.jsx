import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { selectAllCategories } from "../../features/cateSlice";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useEffect } from "react";
import diendadung from "../../../public/images/diendadung.webp";
import dongho from "../../../public/images/dongho.webp";
import laptop from "../../../public/images/laptop.webp";
import suckhoe from "../../../public/images/suckhoe.webp";
import thoitrangnam from "../../../public/images/thoitrangnam.webp";
import thoitrangnu from "../../../public/images/thoitrangnu.webp";

import thucanvat from "../../../public/images/thucanvat.jpg";
import thucpham from "../../../public/images/thucpham.jpg";
import phukien from "../../../public/images/phukien.jpg";
import douong from "../../../public/images/douong.jpg";

const CategorySection = () => {
  const categories = useSelector((state) => selectAllCategories(state));
  const [startIndex, setStartIndex] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width]);

  const itemsPerPage = width > 1024 ? 7 : width > 768 ? 4 : 2; // Dynamically adjust based on width

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleNext = () => {
    if (startIndex < categories.length - itemsPerPage) {
      setStartIndex(startIndex + 1);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate("/cate-page", { state: { categoryName } });
  };

  return (
    <div className="category-section">
      <div style={{ padding: 20 }}>
        <div className="category-header">
          <h3 className="h3-title">Danh Mục</h3>
        </div>
        <div className="category-container">
          <button
            className="arrow-btn left"
            onClick={handlePrev}
            disabled={startIndex === 0}
          >
            <KeyboardArrowLeftIcon />
          </button>
          <div className="category-list">
            {categories
              ?.slice(startIndex, startIndex + itemsPerPage)
              ?.map((category) => {
                let imgSrc;
                switch (category.categoriesName) {
                  case "Điện Da Dụng":
                    imgSrc = diendadung;
                    break;
                  case "Thức ăn vặt":
                    imgSrc = thucanvat;
                    break;
                  case "Đồ công nghệ":
                    imgSrc = laptop;
                    break;
                  case "Thực phẩm":
                    imgSrc = thucpham;
                    break;
                  case "Đồ uống":
                    imgSrc = douong;
                    break;
                  case "Phụ kiện":
                    imgSrc = phukien;
                    break;
                  case "Thời trang nam":
                    imgSrc = thoitrangnam;
                    break;
                  case "Thời trang nữ":
                    imgSrc = thoitrangnu;
                    break;
                  case "Sức khoẻ":
                    imgSrc = suckhoe;
                    break;
                  case "Đồng hồ":
                    imgSrc = dongho;
                    break;
                  default:
                    imgSrc = "https://via.placeholder.com/100"; // Link đến hình mặc định nếu không có ảnh
                }
                return (
                  <div
                    key={category._id}
                    onClick={() => handleCategoryClick(category.categoriesName)}
                    className="category-item"
                  >
                    <img src={imgSrc} alt={category.categoriesName} />
                    <p>{category.categoriesName}</p>
                  </div>
                );
              })}
          </div>
          <button
            className="arrow-btn right"
            onClick={handleNext}
            disabled={startIndex >= categories.length - itemsPerPage}
          >
            <KeyboardArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
