import React from "react";
import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Cart.css";
import prod1 from "../../../public/images/prod1.webp";
import FooterSection from "../../components/Sections/FooterSection";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";
import { useEffect } from "react";
import {
  addToCart,
  deleteCartItem,
  getCartItemByBuyerId,
} from "../../api/cartAPI";
import { useSelector } from "react-redux";
import { getClassifiesByProductId, getProductById } from "../../api/productAPI";
import Notification from "../../components/Notification/Notification";
import { Modal } from "@mui/material";
import { addTradeAPI, tradePaymentAPI } from "../../api/tradeAPI";
import Loading from "../../components/Loading/Loading";
import CachedIcon from "@mui/icons-material/Cached";

const Cart = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [cartItems, setCartItems] = useState([]);
  const [selectedClassifies, setSelectedClassifies] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [productData, setProductData] = useState({});
  const [showNotification, setShowNotification] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState(user.address || "");
  const [openPurchaseModal, setOpenPurchaseModal] = useState(false);

  const [loading, setLoading] = useState(false);

  // Fetch cart items for the current user
  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const response = await getCartItemByBuyerId(user._id);
        const processedItems = response.data.products.flatMap((product) =>
          product.items.map((item) => ({
            ...item,
            seller: product.seller,
            numberProduct: item.numberProduct || 1,
            price: item.price,
          }))
        );
        setCartItems(processedItems);
        console.log("Cart items:", processedItems);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, [user._id]);

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
        console.log("Product data:", productDataMap);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    if (cartItems.length > 0) {
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
        console.log("Selected classifies:", selectedClassifies);
      } catch (error) {
        console.log(error);
      }
    };
    if (cartItems.length > 0) {
      fetchClassifyData();
    }
  }, [cartItems]);

  // Xử lý thay đổi số lượng sản phẩm trong giỏ hàng
  const handleQuantityChange = async (productId, classifyId, delta) => {
    const item = cartItems.find(
      (item) => item.productId === productId && item.classifyId === classifyId
    );
    if (!item) return;

    const newQuantity = item.numberProduct + delta;

    if (newQuantity <= 0) return; // Không cho phép số lượng nhỏ hơn 1

    const cartDTO = {
      buyer: user._id,
      productId: item.productId,
      classifyId: item.classifyId,
      seller: item.seller,
      numberProduct: 1, // chỉ thêm/bớt 1 sản phẩm mỗi lần
    };

    try {
      let response;
      if (delta > 0) {
        // Tăng số lượng sản phẩm
        response = await addToCart(cartDTO);
      } else {
        // Giảm số lượng sản phẩm
        response = await deleteCartItem(cartDTO);
      }

      if (response.status === 201) {
        setCartItems((prevItems) =>
          prevItems.map((item) => {
            if (
              item.productId === productId &&
              item.classifyId === classifyId
            ) {
              return {
                ...item,
                numberProduct: newQuantity,
              };
            }
            return item;
          })
        );
        console.log("Cart items:", cartItems);
      } else {
        console.error("Failed to update cart item quantity");
      }
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
    }
  };

  // Xử lý mở modal xác nhận xóa sản phẩm khỏi giỏ hàng
  const handleOpenModal = (productId, classifyId) => {
    const dataDelete = {
      productId,
      classifyId,
    };
    setItemToDelete(dataDelete); // Sử dụng productId để xác định mục cần xóa
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);

    if (!itemToDelete) {
      console.error("Item muốn xóa không hợp lệ");
      return;
    }

    const { productId, classifyId } = itemToDelete;

    const cartDTO = {
      buyer: user._id,
      productId,
      classifyId,
      seller: cartItems.find(
        (item) => item.productId === productId && item.classifyId === classifyId
      )?.seller,
      numberProduct: cartItems.find(
        (item) => item.productId === productId && item.classifyId === classifyId
      )?.numberProduct,
    };
    console.log("Cart DTO:", cartDTO);
    try {
      const response = await deleteCartItem(cartDTO);
      if (response.status === 201) {
        setCartItems((prevItems) =>
          prevItems.filter(
            (cartItem) =>
              cartItem.productId !== productId ||
              cartItem.classifyId !== classifyId
          )
        );
        setShowNotification(true);
      } else {
        console.error("Xoá sản phẩm không thành công");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setShowModal(false);
      setItemToDelete(null);
      setLoading(false);
    }
  };

  // Xử lý hủy xóa sản phẩm khỏi giỏ hàng
  const handleCancelDelete = () => {
    setShowModal(false);
    setItemToDelete(null);
  };

  const handlePurchase = async () => {
    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.includes(`${item.productId}-${item.classifyId}`)
    );

    if (selectedCartItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    // Group items by seller
    const groupedBySeller = selectedCartItems.reduce((acc, item) => {
      const sellerId = item.seller;

      // If this seller hasn't been added to the accumulator yet, create a new entry for the seller
      if (!acc[sellerId]) {
        acc[sellerId] = {
          seller: sellerId, // This represents the seller's ID
          items: [], // Initialize with an empty items array for this seller
        };
      }

      // Add the current item to the seller's items list
      acc[sellerId].items.push({
        productId: item.productId,
        classifyId: item.classifyId,
        numberProduct: item.numberProduct,
      });

      return acc;
    }, {});

    // Convert the grouped object into an array of sellers with their respective items
    const formData = {
      buyer: user._id,
      products: Object.values(groupedBySeller), // Convert the object to an array of sellers with items
      paymentMethod: paymentMethod,
      address: deliveryAddress,
      from: "cart",
    };
    setLoading(true);
    // Process the formData with the selected items for payment
    try {
      console.log("Adding trade:", formData);
      const tradeResponse = await addTradeAPI(formData, user.access_token);

      if (tradeResponse.status === 201) {
        console.log("Trade added successfully:", tradeResponse.data);
        const tradeId = tradeResponse.data.tradeId;

        if (paymentMethod === "cash") {
          setOpenPurchaseModal(false);
        }

        if (paymentMethod === "zalo") {
          const paymentData = {
            tradeId: [...tradeId],
            method: "zalo",
          };
          console.log("payment data: ", paymentData);

          const paymentResponse = await tradePaymentAPI(
            paymentData,
            user.access_token
          );
          console.log("Payment response:", paymentResponse.data);
          const { order_url } = paymentResponse.data;

          if (order_url) {
            // window.location.href = order_url;
            window.open(order_url);
          }
        }
      }
    } catch (error) {
      console.error("Error adding trade:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPurchaseModal = () => {
    setOpenPurchaseModal(true);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="shopping-cart">
      {loading && <Loading />}
      {showNotification && (
        <Notification
          message="Xóa sản phẩm thành công!"
          onClose={() => setShowNotification(false)}
        />
      )}
      <Navbar />
      <div className="cart-content">
        <h2 className="text-2xl text-center pb-4 font-medium">
          Giỏ hàng của bạn
        </h2>
        <div className="cart-items">
          {cartItems?.map((item) => {
            const product = productData[item.productId];
            const classify =
              selectedClassifies[`${item.productId}-${item.classifyId}`];
            const itemPrice = classify?.price || item.price;
            const totalPrice = itemPrice * item.numberProduct;

            const isSelected = selectedItems.includes(
              `${item.productId}-${item.classifyId}`
            );

            const handleSelectionChange = () => {
              const itemKey = `${item.productId}-${item.classifyId}`;
              if (isSelected) {
                setSelectedItems((prevSelected) =>
                  prevSelected.filter((key) => key !== itemKey)
                );
              } else {
                setSelectedItems((prevSelected) => [...prevSelected, itemKey]);
              }
            };

            return (
              <div
                key={`${item.productId}-${item.classifyId}`}
                className="item-cart"
              >
                <div className="product-info">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleSelectionChange}
                    className="select-checkbox"
                  />
                  <img
                    src={product?.images[0] || prod1}
                    alt={product?.productName || "Product Image"}
                  />
                  <div className="detail">
                    <h3>{product?.productName || "Loading..."}</h3>
                    {classify && (
                      <>
                        <p className="text-sm">
                          <strong>{classify?.key}:</strong> {classify?.value}
                        </p>
                      </>
                    )}
                    <p className="text-sm">
                      <strong>Brand:</strong> {product?.brand || "Loading..."}
                    </p>
                  </div>
                </div>
                <div className="product-quantity">
                  <button
                    disabled={item.numberProduct <= 1}
                    onClick={() =>
                      handleQuantityChange(item.productId, item.classifyId, -1)
                    }
                    className={`subtraction ${
                      item.numberProduct <= 1 ? "disabled" : ""
                    }`}
                  >
                    -
                  </button>
                  <input type="text" value={item.numberProduct} readOnly />
                  <button
                    disabled={
                      selectedClassifies[`${item.productId}-${item.classifyId}`]
                        ?.stock == 0
                    }
                    onClick={() =>
                      handleQuantityChange(item.productId, item.classifyId, +1)
                    }
                    className={`addition ${
                      selectedClassifies[`${item.productId}-${item.classifyId}`]
                        ?.stock == 0
                        ? "disabled"
                        : ""
                    }`}
                  >
                    +
                  </button>
                </div>
                <div className="product-price">
                  <p className="text-sm">
                    Giá:{" "}
                    {itemPrice >= 1000
                      ? itemPrice.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : `${itemPrice} đ`}
                  </p>
                  <p className="text-sm">
                    Tổng:{" "}
                    {totalPrice >= 1000
                      ? totalPrice.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : `${totalPrice} đ`}
                  </p>
                </div>
                <div className="product-action">
                  <button
                    onClick={() =>
                      handleOpenModal(item.productId, item.classifyId)
                    }
                    className="btn-delete"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="cart-actions">
          <button className="continue-shopping">Tiếp Tục Shopping</button>
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 active:bg-blue-500 active:text-white`}
              onClick={handleReload}
            >
              <CachedIcon />
            </button>
            <button
              onClick={handleOpenPurchaseModal}
              className="make-purchase disabled:bg-gray-300"
              disabled={selectedItems.length === 0}
            >
              Thanh Toán
            </button>
          </div>
        </div>
      </div>

      <div className="cart-footer">
        <FooterSection />
      </div>
      {showModal && (
        <ConfirmationModal
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
      {openPurchaseModal && (
        <Modal
          open={openPurchaseModal}
          onClose={() => setOpenPurchaseModal(false)}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-20">
            <h2 className="text-xl font-bold mb-4 text-center">
              Xác nhận thanh toán
            </h2>

            <div className="flex space-x-4">
              {/* Left Side: Scrollable Cart Items */}
              <div className="w-3/5 h-96 overflow-y-auto border-r pr-4">
                {cartItems
                  .filter((item) =>
                    selectedItems.includes(
                      `${item.productId}-${item.classifyId}`
                    )
                  )
                  .map((item) => {
                    const product = productData[item.productId];
                    const classify =
                      selectedClassifies[
                        `${item.productId}-${item.classifyId}`
                      ];
                    const itemPrice = classify?.price || item.price;
                    const totalPrice = itemPrice * item.numberProduct;
                    const image =
                      product?.images[0] || "/placeholder-image.png";

                    return (
                      <div
                        key={`${item.productId}-${item.classifyId}`}
                        className="mb-4 border-b pb-4 flex"
                      >
                        {/* Item Image */}
                        <img
                          src={image}
                          alt={product?.productName || "Product Image"}
                          className="w-16 h-16 object-cover mr-4"
                        />
                        <div>
                          <p className="font-medium">
                            {product?.productName || "Loading..."}
                          </p>
                          {classify && (
                            <p className="text-sm text-gray-500">
                              {classify?.key}: {classify?.value}
                            </p>
                          )}
                          <p className="text-sm text-gray-700">
                            Số lượng: {item.numberProduct}
                          </p>
                          <p className="text-sm text-gray-700">
                            Giá:{" "}
                            {itemPrice >= 1000
                              ? itemPrice.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })
                              : `${itemPrice} đ`}
                          </p>
                          <p className="font-bold">
                            Tổng:{" "}
                            {totalPrice >= 1000
                              ? totalPrice.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })
                              : `${totalPrice} đ`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Right Side: Buyer Info & Payment Method */}
              <div className="w-2/5">
                <div className="mb-4">
                  <h3 className="font-medium">Thông tin người mua</h3>
                  <p className="text-sm text-gray-700">Tên: {user.name}</p>
                  <p className="text-sm text-gray-700">
                    Số điện thoại: {user.number}
                  </p>
                </div>

                <div className="mb-4">
                  <span className="font-medium">Địa chỉ giao hàng:</span>
                  <p className="text-gray-600">{user.address}</p>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium">Phương thức thanh toán</h3>
                  <div className="mt-2 flex space-x-4">
                    <button
                      className={`border px-4 py-2 rounded-md whitespace-nowrap ${
                        paymentMethod === "cash"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setPaymentMethod("cash")}
                    >
                      Thanh toán khi nhận hàng
                    </button>
                    <button
                      className={`border px-4 py-2 rounded-md whitespace-nowrap ${
                        paymentMethod === "zalo"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setPaymentMethod("zalo")}
                    >
                      Zalo Pay
                    </button>
                  </div>
                  <p
                    className={`text-red-500 text-sm mt-2 ${
                      paymentMethod === "" ? "visible" : "invisible"
                    }`}
                  >
                    Vui lòng chọn phương thức thanh toán
                  </p>
                </div>

                {/* Confirm & Cancel Buttons */}
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    className="bg-gray-400 text-white px-4 py-2 rounded-md"
                    onClick={() => setOpenPurchaseModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300"
                    onClick={handlePurchase}
                    disabled={!paymentMethod || !deliveryAddress}
                  >
                    {loading
                      ? paymentMethod === "zalo"
                        ? "Đang thanh toán..."
                        : "Đang đặt hàng..."
                      : paymentMethod === "zalo"
                      ? "Thanh toán"
                      : "Đặt hàng"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Cart;
