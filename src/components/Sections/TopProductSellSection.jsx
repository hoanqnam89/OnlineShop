import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";

const TopProductSellSection = ({ topProductSelled }) => {
  const [rating, setRating] = useState(4);

  const getPrice = (classifies) => {
    if (classifies.length === 0) return 0;
    return Math.min(...classifies.map((classify) => classify.price));
  };

  return (
    <>
      <div className="product-container">
        {topProductSelled?.map((product) => (
          <RouterLink
            className="product-link"
            to={`/product/${product._id}`}
            state={{ product }}
            key={product._id}
          >
            <div className="product-item">
              <img src={product.images[0]} alt="product" />
              <div className="product-detail">
                <p className="product-name">{product.productName}</p>
                <div className="product-rating">
                  <Rating
                    name="read-only"
                    size="small"
                    value={rating}
                    readOnly
                  />
                  <Typography variant="body2" color="text.secondary">
                    4.0 (23)
                  </Typography>
                </div>
                <div className="product-price">
                  <span className="text-secondary">
                    {getPrice(product.classifies) >= 1000
                      ? getPrice(product.classifies).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : `${getPrice(product.classifies)} đ`}
                  </span>
                  <span>Đã bán {product.selled}</span>
                </div>
              </div>
            </div>
          </RouterLink>
        ))}
      </div>
    </>
  );
};

export default TopProductSellSection;
