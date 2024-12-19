import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProductSection from "../Sections/ProductSection";
import { Pagination, Stack } from "@mui/material";
import { useState } from "react";
import {
  getProductsBySellerId,
  getProductsDynamic,
} from "../../api/productAPI";
import Loading from "../Loading/Loading";

const ProductSearch = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const location = useLocation();
  const searchResults = location.state?.searchResults || [];
  const valueToSearch = location.state?.valueToSearch || "";
  const sellerId = location.state?.sellerId || [];
  const sellerName = location.state?.sellerName || "";
  const cateName = location.state?.categoryName || "";
  const [loading, setLoading] = useState(false);

  const [productsSeller, setProductsSeller] = useState([]);
  const [productsCategory, setProductsCategory] = useState([]);

  useEffect(() => {
    const fetchProductBySellerId = async () => {
      setLoading(true);
      try {
        if (sellerId.length > 0) {
          const response = await getProductsBySellerId(sellerId, currentPage);
          setProductsSeller(response.data);
        }
      } catch (error) {
        console.log("Error fetching top seller: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductBySellerId();
  }, [sellerId, currentPage]);

  useEffect(() => {
    const fetchProductByCategory = async () => {
      setLoading(true);
      try {
        if (cateName.length > 0) {
          const response = await getProductsDynamic(
            `&page=${currentPage}&brand=&cate=${cateName}`
          );
          let products = response.data.data;
          setTotalPages(Math.ceil(response.data.soLuongSP / 20));
          setProductsCategory(products);
        }
      } catch (error) {
        console.log("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductByCategory();
  }, [cateName, currentPage]);

  const hasSearchResults = searchResults.length > 0;
  const hasCategoryProducts = productsCategory.length > 0;
  const hasProductsSeller = productsSeller.length > 0;

  // handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {loading && <Loading />}
      <div className="w-[70%] mx-auto py-8">
        {/* Search Header */}
        <div className="bg-white p-5 rounded-s">
          {valueToSearch && (
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              Kết Quả Tìm Kiếm Cho: "{valueToSearch}"
            </h1>
          )}
          {!valueToSearch && cateName && (
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              Sản Phẩm Theo Danh Mục: "{cateName}"
            </h1>
          )}
          {hasProductsSeller > 0 && (
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              Sản Phẩm Của Shop "{sellerName}"
            </h1>
          )}
        </div>

        {/* Product Grid */}
        <div className="mt-8">
          {hasSearchResults ? (
            <ProductSection products={searchResults} />
          ) : hasCategoryProducts ? (
            <ProductSection products={productsCategory} />
          ) : hasProductsSeller ? (
            <ProductSection products={productsSeller} />
          ) : (
            <p className="text-center text-gray-700">Không có sản phẩm nào.</p>
          )}
        </div>
      </div>
      <div className="page-selection">
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": {
                // color: "#8bc34a",
                "&.Mui-selected": {
                  color: "white",
                  backgroundColor: "#8bc34a",
                },
              },
            }}
          />
        </Stack>
      </div>
    </div>
  );
};

export default ProductSearch;
