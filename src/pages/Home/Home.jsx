import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Home.css";
import SliderSection from "../../components/Sections/SliderSection";
import BannerSection from "../../components/Sections/BannerSection";
import CategorySection from "../../components/Sections/CategorySection";
import ProductSection from "../../components/Sections/ProductSection";
import FooterSection from "../../components/Sections/FooterSection";
import { useLocation } from "react-router-dom";
import { Alert } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";
import { useEffect } from "react";
import Notification from "../../components/Notification/Notification";
import {
  getClassifiesByProductId,
  getProductMainPage,
  getProductsDynamic,
} from "../../api/productAPI";
import Loading from "../../components/Loading/Loading";
import { useDispatch } from "react-redux";
import { fetchCategories } from "../../actions/cateAction";
import TopSellerSection from "../../components/Sections/TopSellerSection";
import TopProductSellSection from "../../components/Sections/TopProductSellSection";
import TopProductNew from "../../components/Sections/TopProductNew";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [topProductSelled, setTopProductSelled] = useState([]);
  const [topProductNew, setTopProductNew] = useState([]);
  const locate = useLocation();
  const successMessage = locate.state ? locate.state.successMessage : "";
  const [showNotification, setShowNotification] = useState(!!successMessage);
  const [loading, setLoading] = useState(false);

  // get all products
  useEffect(() => {
    const fetchProductMainPage = async () => {
      setLoading(true);
      try {
        const { data } = await getProductMainPage();
        const productWithClassifies = await Promise.all(
          data.map(async (product) => {
            const classifiesResponse = await getClassifiesByProductId(
              product._id
            );
            return { ...product, classifies: classifiesResponse.data };
          })
        );
        setProducts(productWithClassifies);
      } catch (error) {
        console.log("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductMainPage();
  }, []);

  useEffect(() => {
    const fetchTopProductSelled = async () => {
      setLoading(true);
      try {
        let query = `&page=${1}&brand=${""}&cate=${""}&${"selled=-1"}`;

        // Fetch products based on dynamic sorting and brand filtering
        const response = await getProductsDynamic(query);

        const slicedData = response.data.data.slice(0, 8);

        setTopProductSelled(slicedData);
      } catch (error) {
        console.log("Error fetching top product selled: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopProductSelled();
  }, []);

  useEffect(() => {
    const fetchTopProductNews = async () => {
      setLoading(true);
      try {
        let query = `&page=${1}&brand=${""}&cate=${""}&${"dateUp=1"}`;

        // Fetch products based on dynamic sorting and brand filtering
        const response = await getProductsDynamic(query);

        const slicedData = response.data.data.slice(0, 8);

        setTopProductNew(slicedData);
      } catch (error) {
        console.log("Error fetching top product selled: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopProductNews();
  }, []);

  // get all categories
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div>
      {loading && <Loading />}
      {showNotification && (
        <Notification
          message={successMessage}
          onClose={() => setShowNotification(false)}
        />
      )}
      <div className="navbar-section">
        <Navbar />
      </div>
      <div className="homepage-content">
        <div className="bg-color-1">
          <div className="slider-banner-section">
            <section className="slider">
              <SliderSection />
            </section>
            <section className="banner">
              <BannerSection />
            </section>
          </div>
        </div>

        <section className="brand">
          <TopSellerSection />
        </section>

        <section className="category">
          <CategorySection />
        </section>

        <section className="products">
          <div className="bg-white rounded shadow-md p-4 text-center items-center flex justify-center">
            <h2 className="text-2xl">Sản Phẩm Bán Chạy</h2>
          </div>

          <div className="pt-5">
            <TopProductSellSection topProductSelled={topProductSelled} />
          </div>
        </section>

        <section className="products">
          <div className="bg-white rounded shadow-md p-4 text-center items-center flex justify-center">
            <h2 className="text-2xl">Sản Phẩm Mới Nhất</h2>
          </div>
          <div className="pt-5">
            <TopProductNew topProductNew={topProductNew} />
          </div>
        </section>

        <section className="products">
          <div className="bg-white rounded shadow-md p-4 text-center items-center flex justify-center">
            <h2 className="text-2xl">Danh Sách Sản Phẩm</h2>
          </div>
          <div className="pt-5">
            <ProductSection isHomepage={true} products={products} />
          </div>
        </section>

        <section className="footer">
          <FooterSection />
        </section>
      </div>
    </div>
  );
};

export default Home;
