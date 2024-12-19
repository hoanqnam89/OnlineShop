import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import ProductSection from "../Sections/ProductSection";
import {
  getClassifiesByProductId,
  getProductsDynamic,
  getTotalProduct,
} from "../../api/productAPI";
import { Drawer, Pagination, Stack } from "@mui/material";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAllCategories } from "../../features/cateSlice";
import { fetchCategories } from "../../actions/cateAction";
import { useLocation, useNavigate } from "react-router-dom";
import SortIcon from "@mui/icons-material/Sort";
import Loading from "../Loading/Loading";

const Category = () => {
  const sortOptions = [
    { name: "Bán chạy", value: "selled", query: "selled=-1" },
    { name: "Mới nhất", value: "dateUp", query: "dateUp=1" },
    { name: "Giá giảm dần", value: "priceDesc", query: "price=-1" },
    { name: "Giá tăng dần", value: "priceAsc", query: "price=1" },
  ];

  const [products, setProducts] = useState([]);
  // const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);

  const [selectedSort, setSelectedSort] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [showMoreCate, setShowMoreCate] = useState(false);
  const [showMoreBrand, setShowMoreBrand] = useState(false);

  const [cateHeight, setCateHeight] = useState(0);
  const [brandHeight, setBrandHeight] = useState(0);

  const cateRef = useRef(null);
  const brandRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let response;
        let query = `&page=${currentPage}&brand=${selectedBrand || ""}&cate=${
          selectedCategory || ""
        }`;

        if (selectedSort) {
          const sortOption = sortOptions.find(
            (option) => option.value === selectedSort
          ).query;
          query += `&${sortOption}`;
          console.log("Query sort", query);
        }

        // Fetch products based on dynamic sorting and brand filtering
        response = await getProductsDynamic(query);
        setTotalPages(Math.ceil(response.data.soLuongSP / 20));
        const data = response.data.data;

        const productWithClassifies = await Promise.all(
          data.map(async (product) => {
            const classifiesResponse = await getClassifiesByProductId(
              product._id
            );
            return { ...product, classifies: classifiesResponse.data };
          })
        );

        // Filter unique brands from products
        const getBrands = data.map((product) => product.brand);
        const uniqueBrands = [...new Set(getBrands)];
        setBrands(uniqueBrands);

        setProducts(productWithClassifies);
      } catch (error) {
        console.log("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, selectedSort, selectedBrand, selectedCategory]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("page", currentPage);
    navigate({ search: params.toString() }, { replace: true });
  }, [currentPage, navigate, location.search]);

  // get all categories
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [categories.length, dispatch]);

  // set height for additional categories
  useEffect(() => {
    setCateHeight(showMoreCate ? cateRef.current.scrollHeight : 0);
  }, [showMoreCate]);

  // set height for additional brands
  useEffect(() => {
    setBrandHeight(showMoreBrand ? brandRef.current.scrollHeight : 0);
  }, [showMoreBrand]);

  // select option sort products
  const handleSortClick = (option) => {
    setSelectedSort(option.value);
  };

  // select brand to filter products
  const handleBrandClick = (brand) => {
    setSelectedBrand(brand);
    console.log("Selected brand", brand);
  };

  // select category to filter products
  const handleCategoryClick = (category) => {
    setSelectedCategory(category.categoriesName);
  };

  // show more categories
  const handleShowMoreCate = () => {
    setShowMoreCate(!showMoreCate);
  };

  // show more brands
  const handleShowMoreBrand = () => {
    setShowMoreBrand(!showMoreBrand);
  };

  // handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const fetchTotalProduct = async () => {
      try {
        const response = await getTotalProduct();
        setTotalPages(Math.ceil(response.data / 20));
      } catch (error) {
        console.error("Failed to fetch total products", error);
      }
    };

    fetchTotalProduct();
  }, [currentPage]);

  return (
    <div className="category">
      {loading && <Loading />}
      <div className="category-left">
        {/* Category filter */}
        <div className="category-filter">
          <h5 className="category__filter-title">Danh mục sản phẩm</h5>
          <ul className="category__filter-list">
            {categories.slice(0, 5).map((category) => (
              <li
                className="category__filter-item"
                key={category._id}
                onClick={() => handleCategoryClick(category)}
              >
                <a
                  href={`#${category.categoriesName}`}
                  className="category__filter-link"
                >
                  {category.categoriesName}
                </a>
              </li>
            ))}
            <div
              ref={cateRef}
              className="additional-categories"
              style={{
                maxHeight: `${cateHeight}px`,
                overflow: "hidden",
                transition: "max-height 0.5s ease",
              }}
            >
              {categories.slice(5).map((category) => (
                <li
                  className="category__filter-item"
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}
                >
                  <a
                    href={`#${category.categoriesName}`}
                    className="category__filter-link"
                  >
                    {category.categoriesName}
                  </a>
                </li>
              ))}
            </div>
            <li className="category__filter-item">
              <p
                className="category__filter-link"
                onClick={handleShowMoreCate}
                style={{ cursor: "pointer", color: "#ff5722" }}
              >
                {showMoreCate ? "Thu gọn" : "Xem thêm"}
              </p>
            </li>
          </ul>
        </div>

        {/* Brand filter */}
        <div className="category-filter">
          <h5 className="category__filter-title">Thương hiệu</h5>
          <ul className="category__filter-list">
            {brands.slice(0, 5).map((brand) => (
              <li className="category__filter-item" key={brand}>
                <a
                  href={`#${brand}`}
                  onClick={() => handleBrandClick(brand)}
                  className={`category__filter-link ${
                    selectedBrand === brand ? "active" : ""
                  }`}
                >
                  {brand}
                </a>
              </li>
            ))}
            <div
              ref={brandRef}
              className="additional-brands"
              style={{
                maxHeight: `${brandHeight}px`,
                overflow: "hidden",
                transition: "max-height 0.5s ease",
              }}
            >
              {brands.slice(5).map((brand) => (
                <li className="category__filter-item" key={brand}>
                  <a
                    href={`#${brand}`}
                    onClick={() => handleBrandClick(brand)}
                    className={`category__filter-link ${
                      selectedBrand === brand ? "active" : ""
                    }`}
                  >
                    {brand}
                  </a>
                </li>
              ))}
            </div>
            {brands.length > 5 && (
              <li className="category__filter-item">
                <p
                  className="category__filter-link"
                  onClick={handleShowMoreBrand}
                  style={{ cursor: "pointer", color: "#ff5722" }}
                >
                  {showMoreBrand ? "Thu gọn" : "Xem thêm"}
                </p>
              </li>
            )}
          </ul>
        </div>

        <div className="product-header-mobile">
          <button className="filter-btn" onClick={toggleDrawer}>
            <SortIcon />
          </button>
          <h1>Danh Sách Sản Phẩm</h1>
        </div>
        <Drawer anchor="right" open={isDrawerOpen} onClose={toggleDrawer}>
          <div className="drawer-container">
            <div className="drawer-sort filter-drawer">
              <h5>Sắp xếp theo</h5>
              <ul className="category__filter-list">
                {sortOptions.map((option) => (
                  <li className="category__filter-item" key={option.value}>
                    <a
                      onClick={() => {
                        handleSortClick(option);
                        toggleDrawer(); // Đóng drawer khi chọn sắp xếp
                      }}
                      className={`category__filter-link ${
                        selectedSort === option.value ? "active" : ""
                      }`}
                    >
                      {option.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories in Drawer */}
            <div className="filter-drawer">
              <h5>Danh mục sản phẩm</h5>
              <ul className="category__filter-list">
                {categories.slice(0, 5).map((category) => (
                  <li className="category__filter-item" key={category._id}>
                    <a
                      onClick={() => {
                        handleCategoryClick(category);
                        toggleDrawer(); // Đóng drawer
                      }}
                      href={`#${category.categoriesName}`}
                      className="category__filter-link"
                    >
                      {category.categoriesName}
                    </a>
                  </li>
                ))}
                <div
                  ref={cateRef}
                  className="additional-categories"
                  style={{
                    maxHeight: `${cateHeight}px`,
                    overflow: "hidden",
                    transition: "max-height 0.5s ease",
                  }}
                >
                  {categories.slice(5).map((category) => (
                    <li className="category__filter-item" key={category._id}>
                      <a
                        onClick={() => {
                          handleCategoryClick(category);
                          toggleDrawer(); // Đóng drawer
                        }}
                        href={`#${category.categoriesName}`}
                        className="category__filter-link"
                      >
                        {category.categoriesName}
                      </a>
                    </li>
                  ))}
                </div>
                <li className="category__filter-item">
                  <p
                    className="category__filter-link"
                    onClick={handleShowMoreCate}
                    style={{ cursor: "pointer", color: "#ff5722" }}
                  >
                    {showMoreCate ? "Thu gọn" : "Xem thêm"}
                  </p>
                </li>
              </ul>
            </div>

            {/* Brands in Drawer */}
            <div className="filter-drawer">
              <h5>Thương hiệu</h5>
              <ul className="category__filter-list">
                {brands.slice(0, 5).map((brand) => (
                  <li className="category__filter-item" key={brand}>
                    <a
                      href={`#${brand}`}
                      onClick={() => {
                        handleBrandClick(brand);
                        toggleDrawer();
                      }}
                      className={`category__filter-link ${
                        selectedBrand === brand ? "active" : ""
                      }`}
                    >
                      {brand}
                    </a>
                  </li>
                ))}
                <div
                  ref={brandRef}
                  className="additional-brands"
                  style={{
                    maxHeight: `${brandHeight}px`,
                    overflow: "hidden",
                    transition: "max-height 0.5s ease",
                  }}
                >
                  {brands.slice(5).map((brand) => (
                    <li className="category__filter-item" key={brand}>
                      <a
                        href={`#${brand}`}
                        onClick={() => {
                          handleBrandClick(brand);
                          toggleDrawer();
                        }}
                        className={`category__filter-link ${
                          selectedBrand === brand ? "active" : ""
                        }`}
                      >
                        {brand}
                      </a>
                    </li>
                  ))}
                </div>
                {brands.length > 5 && ( // Chỉ hiển thị nút "Xem thêm" khi có hơn 5 thương hiệu
                  <li className="category__filter-item">
                    <p
                      className="category__filter-link"
                      onClick={handleShowMoreBrand}
                      style={{ cursor: "pointer", color: "#ff5722" }}
                    >
                      {showMoreBrand ? "Thu gọn" : "Xem thêm"}
                    </p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Drawer>
      </div>

      <div className="category-right">
        <div className="product-sort">
          {/* <h5>Sắp xếp theo</h5> */}
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortClick(option)}
              className={`sort-btn ${
                selectedSort === option.value ? "active" : ""
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
        <div className="product-list">
          {loading ? ( // Show loading indicator while loading
            <div className="loading-indicator">Loading...</div>
          ) : (
            <ProductSection products={products} />
          )}
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
    </div>
  );
};

export default Category;
