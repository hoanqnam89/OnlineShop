import React from "react";
import "./Navbar.css";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { Avatar, Drawer, useMediaQuery } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import prod1 from "../../../public/images/prod1.webp";
import { useRef } from "react";
import { useEffect } from "react";
import { logout } from "../../features/authSlice";
import { getCartItemByBuyerId } from "../../api/cartAPI";
import {
  getClassifiesByProductId,
  getProductById,
  getProductsBySearching,
} from "../../api/productAPI";
import Loading from "../Loading/Loading";
import useDebounce from "../Hook/useDebounce";
import Notification from "../Notification/Notification";
import { registerSellerAPI } from "../../api/userAPI";
import { getWalletByUserIdAPI } from "../../api/tradeAPI";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartRef = useRef(null);
  const profileRef = useRef(null);
  const subNavbarLinksRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  // const history = [];
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useDebounce(
    searchTerm || "",
    500
  );
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [productData, setProductData] = useState({});
  const [selectedClassifies, setSelectedClassifies] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [canRegister, setCanRegister] = useState(true); // Kiểm tra điều kiện đầy đủ thông tin
  const [showNotification, setShowNotification] = useState(false);
  const [wallet, setWallet] = useState(null);

  const inputRef = useRef(null);
  const historyRef = useRef(null);
  const historyMobileRef = useRef(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleModal = () => {
    // Kiểm tra nếu thông tin user chưa đầy đủ thì không cho gửi đăng ký
    if (
      user &&
      user.name &&
      user.userName &&
      user.number &&
      user.address &&
      user.sex &&
      user.avata
    ) {
      setCanRegister(true);
    } else {
      setCanRegister(false);
    }
    setShowModal(!showModal);
  };

  useEffect(() => {
    const storedHistory =
      JSON.parse(localStorage.getItem("searchHistory")) || [];
    // setSearchHistory(storedHistory);
    setSearchHistory(storedHistory.filter((term) => typeof term === "string"));
  }, []);

  // useEffect(() => {
  //   if (isFocused) {
  //     // Chỉ khi input đã được focus
  //     if (debouncedSearchTerm || !isTyping) {
  //       setShowHistory(true);
  //     } else {
  //       setShowHistory(false);
  //     }
  //   } else {
  //     // setShowHistory(false);
  //   }
  // }, [debouncedSearchTerm, isTyping, isFocused]);

  const handleSearch = async (searchValue) => {
    const valueToSearch = searchValue.trim();
    if (!valueToSearch) return; // Không tìm kiếm nếu giá trị rỗng

    try {
      const response = await getProductsBySearching(valueToSearch);
      const searchResults = response.data;

      // Cập nhật lịch sử tìm kiếm
      const updatedHistory = [...new Set([valueToSearch, ...searchHistory])];
      setSearchHistory(updatedHistory);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

      setSearchTerm(""); // Reset input
      setShowHistory(false); // Ẩn lịch sử tìm kiếm

      // Điều hướng đến trang kết quả
      navigate("/search-results", {
        state: { searchResults, valueToSearch },
      });
    } catch (error) {
      console.log("Error searching: ", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra nếu click nằm ngoài input và lịch sử
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        historyRef.current &&
        !historyRef.current.contains(event.target) &&
        historyMobileRef.current &&
        !historyMobileRef.current.contains(event.target)
      ) {
        setIsFocused(false); // Đóng focus input
        setShowHistory(false); // Ẩn lịch sử tìm kiếm
      }
    };

    // Lắng nghe sự kiện click trên toàn bộ document
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsTyping(value.length > 0); // Đánh dấu trạng thái đang gõ khi có văn bản
  };

  const handleFocus = () => {
    setIsFocused(true); // Đặt biến isFocused khi input được nhấp vào
    setShowHistory(true); // Hiển thị lịch sử khi nhấp vào input
  };

  const handleLogout = () => {
    setLoading(true);
    try {
      dispatch(logout());
      navigate("/signin");
    } catch (error) {
      console.log("Error logging out: ", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
  };

  const handleShowCart = async () => {
    const response = await getCartItemByBuyerId(user._id);
    const processedItems = response.data?.products?.flatMap((product) =>
      product?.items?.map((item) => ({
        ...item,
        seller: product.seller,
        numberProduct: item.numberProduct || 1,
        price: item.price,
      }))
    );
    setCartItems(processedItems);

    if (isMobile) {
      setOpenDrawer((prev) => !prev);
    } else {
      setShowCart((prev) => !prev);
    }
  };

  // Fetch product data for all product IDs in cartItems
  useEffect(() => {
    const fetchProductData = async () => {
      const productIds = [...new Set(cartItems.map((item) => item.productId))]; // Lấy danh sách productId duy nhất
      const productDataMap = {}; // Dùng để lưu dữ liệu sản phẩm theo productId

      try {
        // Gọi API cho từng productId để lấy thông tin sản phẩm
        await Promise.all(
          productIds.map(async (productId) => {
            const response = await getProductById(productId);
            if (response && response.data && response.data.length > 0) {
              productDataMap[productId] = response.data[0]; // Giả sử API trả về mảng, lấy đối tượng đầu tiên
            }
          })
        );
        setProductData(productDataMap); // Lưu dữ liệu sản phẩm vào state
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    if (cartItems?.length > 0) {
      fetchProductData();
    }
  }, [cartItems]);

  // Fetch selected classify for each product in cartItems
  useEffect(() => {
    const fetchClassifyData = async () => {
      try {
        const classifyMap = {};
        for (const item of cartItems) {
          if (item.productId && item.classifyId) {
            const response = await getClassifiesByProductId(item.productId);
            const allClassifies = response.data;

            const selectedClassify = allClassifies.find(
              (classify) => classify._id === item.classifyId
            );

            if (selectedClassify) {
              classifyMap[`${item.productId}-${item.classifyId}`] =
                selectedClassify;
            }
          }
        }
        setSelectedClassifies(classifyMap);
      } catch (error) {
        console.log(error);
      }
    };
    if (cartItems.length > 0) {
      fetchClassifyData();
    }
  }, [cartItems]);

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);

    const subNavbarLinks = document.querySelector(".sub-navbar-links");

    if (!showMenu) {
      // Khi mở menu
      subNavbarLinks.style.maxHeight = `${subNavbarLinks.scrollHeight}px`;
    } else {
      // Khi đóng menu
      subNavbarLinks.style.maxHeight = "0";
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // Khi màn hình lớn hơn 768px (tablet/desktop), luôn hiển thị sub-navbar
        if (subNavbarLinksRef.current) {
          subNavbarLinksRef.current.style.maxHeight = "none";
        }
      } else {
        // Khi màn hình nhỏ hơn 768px (mobile), đặt lại trạng thái cho sub-navbar
        if (subNavbarLinksRef.current && !showMenu) {
          subNavbarLinksRef.current.style.maxHeight = "0";
        }
      }
    };
    // Gọi hàm handleResize một lần khi component mount
    handleResize();

    // Thêm sự kiện lắng nghe resize
    window.addEventListener("resize", handleResize);

    // Cleanup khi component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, [showMenu]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowCart(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleShowProfile = () => {
    setShowProfile((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false); // Close the dropdown
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRegisterSeller = async () => {
    if (canRegister) {
      const formData = {
        id: user?._id,
      };
      try {
        const response = await registerSellerAPI(formData, user?.access_token);
        console.log("Register seller response: ", response);
        setShowModal(false);
        setShowNotification(true);
      } catch (error) {
        console.log("Error registering seller: ", error);
      }
    }
  };

  useEffect(() => {
    const fetchWalletByUserId = async () => {
      const response = await getWalletByUserIdAPI(user?._id);
      setWallet(response.data);
    };
    fetchWalletByUserId();
  }, []);

  return (
    <div className="navbar">
      {loading && <Loading />}
      <nav className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-logo">
            <h2
              style={{
                color: "#f0f0f0",
                fontSize: "1.6rem",
                fontWeight: "900",
              }}
            >
              SO-SHOP
            </h2>
          </div>
          <div className="navbar-search">
            <input
              ref={inputRef}
              value={searchTerm}
              onFocus={handleFocus}
              onChange={handleInputChange}
              // onKeyDown={handleSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(searchTerm);
              }}
              className="search-input"
              type="text"
              placeholder="Nhập tên sản phẩm bạn muốn tìm"
            />
            <button
              className="search-btn"
              onClick={() => handleSearch(searchTerm)}
            >
              <SearchIcon />
            </button>
            {showHistory && (
              <div ref={historyRef} className="search-history">
                {searchHistory.length === 0 ? (
                  <p className="history-item disabled" disabled>
                    Chưa có lịch sử tìm kiếm
                  </p>
                ) : isTyping ? (
                  searchHistory
                    ?.filter((term) => {
                      // Chỉ lọc khi người dùng đang gõ text
                      if (
                        typeof term === "string" &&
                        typeof debouncedSearchTerm === "string"
                      ) {
                        return term
                          .toLowerCase()
                          .includes(debouncedSearchTerm.toLowerCase());
                      }
                      return false;
                    })
                    .slice(0, 6) // Chỉ hiển thị 6 từ khóa mới nhất
                    .map((term, index) => (
                      <p
                        className="history-item"
                        key={index}
                        onClick={() => handleSearch(term)}
                      >
                        {term}
                      </p>
                    ))
                ) : (
                  searchHistory
                    ?.slice(0, 6) // Hiển thị 6 từ khóa mới nhất khi chưa gõ text
                    ?.map((term, index) => (
                      <p
                        className="history-item"
                        key={index}
                        onClick={() => handleSearch(term)}
                      >
                        {term}
                      </p>
                    ))
                )}
              </div>
            )}
          </div>
          <div className="cart-avatar">
            <div className="navbar-cart" ref={cartRef}>
              <button className="cart-btn" onClick={handleShowCart}>
                <ShoppingCartOutlinedIcon sx={{ color: "white" }} />
                {/* <span className="cart-count">3</span> */}
              </button>
              {!isMobile && showCart && (
                <div className={`dropdown-content ${showCart ? "show" : ""} `}>
                  <div className="relative">
                    <div className="cart-title">Sản Phẩm Mới Thêm</div>
                    {/* Container có scroll chỉ cho danh sách sản phẩm */}
                    <div className="cart-items-container">
                      {cartItems.length === 0 ? (
                        <div className="empty-cart-message">
                          Chưa có item nào trong giỏ hàng
                        </div>
                      ) : (
                        cartItems?.map((item) => {
                          const product = productData[item.productId];
                          const classify =
                            selectedClassifies[
                              `${item.productId}-${item.classifyId}`
                            ];
                          const itemPrice = classify?.price || item.price;
                          return (
                            <div
                              className="cart-item-container"
                              key={`${item.productId}-${item.classifyId}`}
                            >
                              <div className="cart-item">
                                <img
                                  src={product?.images[0] || prod1}
                                  alt={product?.productName || "Product Image"}
                                  className="cart-item-img"
                                />
                                <div className="cart-item-info">
                                  <span className="cart-item-name">
                                    {product?.productName || "Loading..."}
                                  </span>
                                  <span className="cart-item-price">
                                    {itemPrice >= 1000
                                      ? itemPrice.toLocaleString("vi-VN", {
                                          style: "currency",
                                          currency: "VND",
                                        })
                                      : `${itemPrice} đ`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {/* Nút luôn ở dưới */}
                    <div className="view-cart-container">
                      <a href="/cart" className="view-cart-button">
                        Xem Giỏ Hàng
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {cartItems.length > 0 ? (
                <Drawer
                  anchor="bottom"
                  open={openDrawer}
                  onClose={() => setOpenDrawer(false)}
                  PaperProps={{
                    style: {
                      height: "60vh",
                      overflow: "auto",
                      padding: "16px",
                    },
                  }}
                  BackdropProps={{
                    style: {
                      backgroundColor: "transparent", // Loại bỏ nền đen khi mở Drawer
                    },
                  }}
                >
                  <div className="cart-title">Sản Phẩm Mới Thêm</div>
                  <div className="cart-items-container">
                    {cartItems?.map((item) => {
                      const product = productData[item.productId];
                      const classify =
                        selectedClassifies[
                          `${item.productId}-${item.classifyId}`
                        ];
                      const itemPrice = classify?.price || item.price;

                      return (
                        <div
                          className="cart-item-container"
                          key={`${item.productId}-${item.classifyId}`}
                        >
                          <div className="cart-item">
                            <img
                              src={product?.images[0] || prod1}
                              alt={product?.productName || "Product Image"}
                              className="cart-item-img"
                            />
                            <div className="cart-item-info">
                              <span className="cart-item-name">
                                {product?.productName || "Loading..."}
                              </span>
                              <span className="cart-item-price">
                                {itemPrice >= 1000
                                  ? itemPrice.toLocaleString("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    })
                                  : `${itemPrice} đ`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <a href="/cart" className="view-cart-button">
                    Xem Giỏ Hàng
                  </a>
                </Drawer>
              ) : (
                <Drawer
                  anchor="bottom"
                  open={openDrawer}
                  onClose={() => setOpenDrawer(false)}
                  PaperProps={{
                    style: {
                      height: "60vh",
                      overflow: "auto",
                      padding: "16px",
                    },
                  }}
                  BackdropProps={{
                    style: {
                      backgroundColor: "transparent", // Loại bỏ nền đen khi mở Drawer
                    },
                  }}
                >
                  <div className="cart-item-container">
                    <div className="empty-cart-message">
                      Chưa có item nào trong giỏ hàng
                    </div>
                  </div>
                  <a href="/cart" className="view-cart-button">
                    Xem Giỏ Hàng
                  </a>
                </Drawer>
              )}
            </div>
            <div className="navbar-avatar">
              {user ? (
                <div ref={profileRef}>
                  <Avatar
                    alt="User"
                    src={user.avata}
                    style={{ cursor: "pointer" }}
                    onClick={handleShowProfile}
                  />
                  {showProfile && (
                    <div
                      className={`dropdown-content dropdown-profile ${
                        showProfile ? "show" : ""
                      }`}
                    >
                      <a href="/">
                        Số dư ví:{" "}
                        <strong className="wallet">
                          {wallet.balance >= 1000
                            ? wallet.balance.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })
                            : `${wallet.balance} đ`}
                        </strong>
                      </a>
                      <a href="/profile">Thông Tin Cá Nhân</a>
                      <a href="/orders">Đơn Hàng Của Bạn</a>
                      <a href="/cart">Giỏ Hàng</a>
                      <a href="/changepass">Đổi mật khẩu</a>
                      <a onClick={handleLogout}>Đăng Xuất</a>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="nav-auth">
                    <Link
                      className="link"
                      style={{ color: "#f0f0f0" }}
                      to="/signin"
                    >
                      Đăng Nhập
                    </Link>
                    <Link className="link primary-btn" to="/signup">
                      Đăng Ký
                    </Link>
                  </div>
                  <div className="nav-auth-mobile">
                    {/* <AccountCircleOutlinedIcon /> */}
                    <div>
                      <Link className="link" to="/signin">
                        Đăng Nhập
                      </Link>
                      {/* <Link className="link primary-btn" to="/signup">
                        Đăng Ký
                      </Link> */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Search bar for mobile */}
        <div className="navbar-search-mobile">
          <input
            ref={inputRef}
            value={searchTerm}
            onFocus={handleFocus}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(searchTerm);
            }}
            className="search-input"
            type="text"
            placeholder="Nhập tên sản phẩm bạn muốn tìm"
          />
          <button
            className="search-btn"
            onClick={() => handleSearch(searchTerm)}
          >
            <SearchIcon />
          </button>
          {showHistory && (
            <div ref={historyMobileRef} className="search-history">
              {searchHistory.length === 0 ? (
                <p className="history-item">Chưa có lịch sử tìm kiếm</p>
              ) : isTyping ? (
                searchHistory
                  .filter((term) => {
                    // Chỉ lọc khi người dùng đang gõ text
                    if (
                      typeof term === "string" &&
                      typeof debouncedSearchTerm === "string"
                    ) {
                      return term
                        .toLowerCase()
                        .includes(debouncedSearchTerm.toLowerCase());
                    }
                    return false;
                  })
                  .slice(0, 6) // Chỉ hiển thị 6 từ khóa mới nhất
                  .map((term, index) => (
                    <p
                      className="history-item"
                      key={index}
                      onClick={() => handleSearch(term)}
                    >
                      {term}
                    </p>
                  ))
              ) : (
                searchHistory
                  ?.slice(0, 6) // Hiển thị 6 từ khóa mới nhất khi chưa gõ text
                  ?.map((term, index) => (
                    <p
                      className="history-item"
                      key={index}
                      onClick={() => handleSearch(term)}
                    >
                      {term}
                    </p>
                  ))
              )}
            </div>
          )}
        </div>

        <div className="sub-navbar">
          <div>
            <button className="menu-btn" onClick={toggleMenu}>
              ☰ Menu {/* use when reponsive design */}
            </button>
          </div>
          <div
            ref={subNavbarLinksRef}
            className={`sub-navbar-links ${showMenu ? "show" : ""}`}
          >
            <div className="sub-navbar-section">
              <Link className="subnavbar-link" to="/">
                Trang Chủ
              </Link>
              <Link className="subnavbar-link" to="/products">
                Sản phẩm
              </Link>
            </div>

            <div className="sub-navbar-section">
              <Link className="subnavbar-link" to="/help">
                Hỗ trợ
              </Link>
              <Link className="subnavbar-link" to="/contact">
                Liên Hệ
              </Link>

              {user ? (
                <>
                  {user.role.includes("ADMIN") && (
                    <Link className="subnavbar-link" to="/admin">
                      Trang Admin
                    </Link>
                  )}
                  {user.role.includes("SELLER") && (
                    <Link className="subnavbar-link" to="/seller">
                      Trang Người Bán
                    </Link>
                  )}
                  {!user.role.includes("ADMIN") &&
                    !user.role.includes("SELLER") &&
                    user.role.includes("BUYER") && (
                      <span
                        className="subnavbar-link cursor-pointer"
                        onClick={toggleModal}
                      >
                        Trở Thành Người Bán
                      </span>
                    )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className={`bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-1000 ease-out ${
              showModal ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">
              Đăng Ký Trở Thành Người Bán
            </h2>
            <p className="mb-2">
              <strong>Họ Tên:</strong> {user.name ? user.name : "Chưa cập nhật"}
            </p>
            <p className="mb-2">
              <strong>Email:</strong>{" "}
              {user.userName ? user.userName : "Chưa cập nhật"}
            </p>
            <p className="mb-2">
              <strong>Số điện thoại:</strong>{" "}
              {user.number ? user.number : "Chưa cập nhật"}
            </p>
            <p className="mb-2">
              <strong>Địa chỉ:</strong>{" "}
              {user.address ? user.address : "Chưa cập nhật"}
            </p>

            <div className="mb-4">
              <strong>Ảnh đại diện cửa hàng:</strong>
              <div className="flex justify-center mt-2">
                <img
                  src={user.avata || ""}
                  alt={`Avatar of ${user.name}`}
                  className="w-[300px] h-[300px] object-fit shadow-md"
                />
              </div>
            </div>

            <button
              className={`w-full py-2 mt-4 text-white rounded ${
                canRegister
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!canRegister}
              onClick={handleRegisterSeller}
            >
              Gửi Đăng Ký
            </button>
            {!canRegister && (
              <p className="text-red-500 text-sm mt-2">
                Vui lòng hoàn thành thông tin của bạn để đăng ký.
              </p>
            )}

            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {showNotification && (
        <Notification
          message="Đã gửi đăng ký bán hàng thành công, vui lòng chờ admin duyệt"
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default Navbar;
