import React, { useState } from "react";
import "./ProductDetail.css";
import Navbar from "../../components/Navbar/Navbar";
import product1 from "../../../public/images/product1.webp";
import product2 from "../../../public/images/product2.webp";
import product3 from "../../../public/images/product3.webp";
import product4 from "../../../public/images/product4.webp";
import prodBanner1 from "../../../public/images/prodBanner1.webp";
import prodBanner2 from "../../../public/images/prodBanner2.webp";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Rating, Typography } from "@mui/material";
import FooterSection from "../../components/Sections/FooterSection";
import DetailList from "../../components/DetailList/DetailList";
import PurchaseModal from "../../components/PurchaseModal/PurchaseModal";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { addToCart } from "../../api/cartAPI";
import Notification from "../../components/Notification/Notification";
import { getProductById } from "../../api/productAPI";
import { getAllCate } from "../../api/cateAPI";
import OrderSuccessModal from "../../components/Modal/OrderSuccessModal";
import { useMemo } from "react";
import Loading from "../../components/Loading/Loading";
import InformLogin from "../../components/Modal/InformLogin";
import RelatedProducts from "../../components/Sections/RelatedProducts";
import { useRef } from "react";
import WarningModal from "../../components/Modal/WarningModal";

const ProductDetail = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [attributesData, setAttributesData] = useState([]);
  const [descriptionData, setDescriptionData] = useState([]);
  const [category, setCategory] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState({});
  const [startIndex, setStartIndex] = useState(0);
  const [rating, setRating] = useState(4);
  const [quantity, setQuantity] = useState(1);
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [groupClassifies, setGroupClassifies] = useState({});
  const [showNotification, setShowNotification] = useState(false);

  const [isModalSuccessOrderOpen, setModalSuccessOrderOpen] = useState(false);
  const [images, setImages] = useState([]);
  const visibleThumbnail = images;
  const [loading, setLoading] = useState(false);
  const [openInform, setOpenInform] = useState(false);
  const [canPurchase, setCanPurchase] = useState(false);
  const [showWarningUpdate, setShowWarningUpdate] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [statusAddToCart, setStatusAddToCart] = useState("");

  const [itemPurchase, setItemPurchase] = useState({
    buyer: "",
    productId: "",
    productName: "",
    category: "",
    classifyId: "",
    seller: "",
    numberProduct: 0,
    price: 0,
  });

  const itemAddToCart = {
    buyer: "",
    productId: "",
    classifyId: "",
    seller: "",
    numberProduct: quantity,
  };

  const topRef = useRef(null);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await getProductById(id);
        if (response.status === 200) {
          // console.log(response.data[0]);
          setAttributesData(response.data[0].attributes);
          setDescriptionData(response.data[0].decriptions);
          setProduct(response.data[0]);
          setImages(response.data[0].images);

          // Đặt currentImage là ảnh đầu tiên nếu có ảnh
          if (response.data[0].images && response.data[0].images.length > 0) {
            setCurrentImage(response.data[0].images[0]);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    setQuantity(1);
    setSelectedKey("");
    setSelectedValue("");
    setSelectedOptions({});
    fetchProduct();
  }, [id]);

  // find category name by category id
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCate();
        if (response.status === 200) {
          const category = response.data.find(
            (cate) => cate._id === product.cate
          );
          setCategory(category.categoriesName);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategories();
  }, [product]);

  // group classifies by key
  useEffect(() => {
    getGroupClassifies();
  }, [product]);

  const getGroupClassifies = () => {
    if (product && product.classifies) {
      const grouped = product.classifies.reduce((groups, classify) => {
        if (!groups[classify.key]) {
          groups[classify.key] = [];
        }
        groups[classify.key].push(classify);
        return groups;
      }, {});
      setGroupClassifies(grouped);
    }
  };

  // handle option change
  const handleOptionChange = (key, classify) => {
    if (classify.stock > 0) {
      setSelectedOptions(classify);
    }
  };

  // get the lowest price of all classifies
  const getPrice = (classifies) => {
    if (!classifies || classifies.length === 0) return 0; // Return 0 if no classifies
    const prices = classifies
      .map((classify) => classify.price)
      .filter((price) => price > 0);
    return prices.length > 0 ? Math.min(...prices) : 0; // Return the minimum price, or 0 if no valid prices
  };

  const totalPrice = useMemo(() => {
    if (selectedOptions?.price > 0) return selectedOptions.price * quantity;
    const allClassifies = Object.values(groupClassifies).flat();
    return getPrice(allClassifies) * quantity;
  }, [selectedOptions, quantity, groupClassifies]);

  // scroll to top when component mounted
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseWarning = () => {
    setShowWarningUpdate(false);
  };

  const handleNext = () => {
    if (startIndex < images.length - 3) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleKeyChange = (key) => {
    setSelectedKey(key);
    setSelectedValue("");
  };

  const handleValueChange = (value) => {
    setSelectedValue(value);
    setSelectedOptions(value);
    setQuantity(1);
  };

  const handleMouseEnter = (image) => {
    setCurrentImage(image);
  };

  // const handleQuantityChange = (delta) => {
  //   setQuantity((prevQuantity) => Math.max(1, prevQuantity + delta));
  // };

  const handleQuantityChange = (delta) => {
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity + delta;
      // Ensure quantity does not go below 1 or exceed stock of the selected classify
      return Math.max(1, Math.min(newQuantity, selectedOptions.stock || 1));
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      setOpenInform(true);
      return;
    }
    itemAddToCart.buyer = user._id;
    itemAddToCart.productId = product._id;
    itemAddToCart.seller = product.seller;
    itemAddToCart.classifyId = selectedOptions._id;
    // console.log(itemAddToCart);
    try {
      const response = await addToCart(itemAddToCart);

      if (response.status === 201) {
        if (response.data.status !== "thêm thành công") {
          setShowNotification(true);
          setStatusAddToCart("error");
          setAlertMessage(
            "Có lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng refresh trang và thử lại."
          );
          return;
        }

        setStatusAddToCart("success");
        setAlertMessage("Thêm sản phẩm vào giỏ hàng thành công!");
        setShowNotification(true);
        setQuantity(1);
        setSelectedValue("");
        setSelectedOptions({});

        const updatedProduct = await getProductById(product._id);
        if (updatedProduct.status === 200) {
          setProduct(updatedProduct.data[0]);
          setGroupClassifies((groupClassifies) => {
            const grouped = updatedProduct.data[0].classifies.reduce(
              (groups, classify) => {
                if (!groups[classify.key]) {
                  groups[classify.key] = [];
                }
                groups[classify.key].push(classify);
                return groups;
              },
              {}
            );
            return grouped;
          });
        }
      } else {
        alert("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBuyNowClick = () => {
    setLoading(true);
    try {
      if (!product) return;

      if (!user) {
        setOpenInform(true);
        return;
      }

      if (
        !user.name ||
        !user.userName ||
        !user.number ||
        !user.address ||
        !user.sex ||
        !user.avata
      ) {
        setCanPurchase(false);
        setShowWarningUpdate(true); // Hiển thị modal cảnh báo
        return;
      }
      setCanPurchase(true);

      const item = {
        buyer: user._id,
        productId: product._id,
        productName: product.productName,
        brand: product.brand,
        image: product.images[0],
        categoryName: category,
        classify: selectedOptions,
        seller: product.seller,
        numberProduct: quantity,
        price: totalPrice,
      };
      setItemPurchase(item);
      setIsModalOpen(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    // console.log(itemPurchase);
  };

  const handleCloseInform = () => {
    setOpenInform(false);
  };

  if (!product) {
    return <div ref={topRef}>Loading...</div>;
  }

  return (
    <div className="product-detail-page" ref={topRef}>
      {!user && openInform && (
        <InformLogin isOpen={openInform} onClose={handleCloseInform} />
      )}
      {!canPurchase && (
        <WarningModal isOpen={showWarningUpdate} onClose={handleCloseWarning} />
      )}
      {loading && <Loading />}
      {showNotification && (
        <Notification
          message={alertMessage}
          onClose={() => setShowNotification(false)}
          status={statusAddToCart}
        />
      )}
      <Navbar />
      <div className="product-detail-container">
        <div className="product-detail-image">
          <div className="main-image">
            <img src={currentImage} alt="Product" />
          </div>
          <div className="thumbnail-section">
            <button
              // className="arrow-btn"
              onClick={handlePrev}
              disabled={startIndex === 0}
            >
              <KeyboardArrowLeftIcon />
            </button>
            <div className="thumnail-container">
              {visibleThumbnail.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Product ${index + 1}`}
                  onMouseEnter={() => handleMouseEnter(image)}
                  className={currentImage === image ? "active" : ""}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={startIndex >= images.length - 3}
            >
              <KeyboardArrowRightIcon />
            </button>
          </div>
        </div>
        <div className="product-detail-info">
          <div className="detail-name">
            <h3>{product.productName}</h3>
          </div>
          <div className="detail-address">
            <span>Địa chỉ: </span>
            <span>TP.Hồ Chí Minh, Việt Nam.</span>
          </div>

          <div className="detail-inline">
            <div className="product-type">
              <span>Danh mục: </span>
              <span>{category}</span>
            </div>
            <div className="product-rating" style={{ marginLeft: "30%" }}>
              <Rating name="read-only" size="small" value={rating} readOnly />
              <Typography variant="body2" color="text.secondary">
                4.0 (23 đánh giá)
              </Typography>
            </div>
          </div>
          <div className="detail-brand">
            <span>Thương hiệu: </span>
            <a href="#">{product.brand}</a>
          </div>
          <div className="detail-price">
            <div className="product-price">
              <span className="text-secondary price-promotional">
                {totalPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
              {/* <span className="text-primary price-original">
                {getPrice(product.classifies).toLocaleString("vi-VN")}đ
              </span> */}
            </div>
            <div>
              <span>Đã bán: </span>
              <span className="text-secondary">{product.selled}</span>
              <span> sản phẩm</span>
            </div>
          </div>

          <div className="detail-classifies">
            {Object.keys(groupClassifies)?.map((key) => (
              <button
                key={key}
                className={`key-btn ${selectedKey === key ? "selected" : ""}`}
                onClick={() => handleKeyChange(key)}
              >
                {key}
              </button>
            ))}
          </div>
          {selectedKey && (
            <div className="detail-classifies-values">
              {groupClassifies[selectedKey]?.map((classify) => (
                <button
                  key={classify._id}
                  className={`value-btn ${
                    selectedValue._id === classify._id ? "selected" : ""
                  } ${classify.stock <= 0 ? "disable-btn" : ""}`}
                  onClick={() =>
                    classify.stock > 0 && handleValueChange(classify)
                  } // Only allow selection if stock > 0
                  disabled={classify.stock === 0} // Disable if out of stock
                >
                  {classify.value} (
                  {classify.stock > 0 ? "Còn hàng" : "Hết hàng"})
                </button>
              ))}
            </div>
          )}

          <div className="detail-quantity">
            <span>Số lượng: </span>
            <div className="product-quantity">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="subtraction"
              >
                -
              </button>
              <input type="text" value={quantity} readOnly />
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= (selectedOptions.stock || 1)}
                className={`addition ${
                  quantity >= (selectedOptions.stock || 1) ? "disabled" : ""
                }`}
              >
                +
              </button>
            </div>
          </div>
          <div className="detail-action">
            <button
              onClick={handleAddToCart}
              disabled={!selectedOptions._id}
              className="add-cart-btn"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleBuyNowClick}
              disabled={!selectedOptions._id}
              className="buy-now-btn"
            >
              Mua ngay
            </button>
            <PurchaseModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              // product={product}
              product={itemPurchase}
              onShowSuccessOrderModal={() => setModalSuccessOrderOpen(true)}
            />
            {/* OrderSuccessModal controlled from parent */}
            <OrderSuccessModal
              isOpen={isModalSuccessOrderOpen}
              onClose={() => setModalSuccessOrderOpen(false)}
            />
          </div>
        </div>
      </div>
      <div className="product-about">
        <div className="detail-product">
          <h2>Mô tả sản phẩm</h2>
          <DetailList details={attributesData} />
        </div>
        <div className="detail-product">
          <h2>Thông tin sản phẩm</h2>
          <DetailList details={descriptionData} />
        </div>
      </div>
      {/* Related Products */}
      <div className="related-product">
        <div className="label-title">
          <h2>Sản phẩm liên quan</h2>
        </div>
        <div className="related-item">
          <RelatedProducts categoryName={category} />
        </div>
      </div>
      <div className="product-footer">
        <FooterSection />
      </div>
    </div>
  );
};

export default ProductDetail;
