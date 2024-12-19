import React, { useEffect } from "react";
import { useState } from "react";
import { getProductsDynamic } from "../../api/productAPI";
import ProductSection from "./ProductSection";

const RelatedProducts = ({ categoryName }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      const response = await getProductsDynamic(
        `&page=${1}&brand=&cate=${categoryName}`
      );
      const slicedData = response.data.data.slice(0, 4);
      setRelatedProducts(slicedData);
      console.log("relatedProducts", response.data);
    };
    fetchRelatedProducts();
  }, [categoryName]);

  return (
    <div>
      <ProductSection products={relatedProducts} />
    </div>
  );
};

export default RelatedProducts;
