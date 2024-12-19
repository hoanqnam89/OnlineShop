import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import FooterSection from "../../components/Sections/FooterSection";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Modal from "@mui/material/Modal";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import SortIcon from "@mui/icons-material/Sort";
import { useEffect } from "react";
import {
  addTradeAPI,
  cancelTradeAPI,
  getTradeAPI,
  getUpdateTradeStatusAPI,
  tradePaymentAPI,
} from "../../api/tradeAPI";
import { useSelector } from "react-redux";
import { getProductById } from "../../api/productAPI";
import "../Orders/Orders.css";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Loading from "../../components/Loading/Loading";

const Orders = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("paid");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [orders, setOrders] = useState([]);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrdersWithDetails = async () => {
      setLoading(true);
      try {
        const fetchedOrders = await getTradeAPI(user._id, user.access_token);

        if (fetchedOrders.status === 200) {
          console.log("Fetched orders", fetchedOrders.data);
          const detailedOrders = await Promise.all(
            fetchedOrders.data.map(async (order) => {
              // Fetch product details for each product in the order
              const productDetails = await Promise.all(
                order.products.map(async (product) => {
                  const productResponse = await getProductById(
                    product.productId
                  );

                  if (productResponse.status === 200) {
                    const productData = productResponse.data[0];

                    console.log("Product name", productData.productName);

                    // Get classify details for the current product
                    const classify = productData.classifies?.find(
                      (c) => c._id === product.classifyId
                    );

                    console.log("Classify details", classify);

                    return {
                      productId: productData._id,
                      productName: productData.productName,
                      image: productData.images?.[0] || "",
                      brand: productData.brand,
                      category: productData.category,
                      classify: classify ? classify.value : "N/A",
                      price: classify ? classify.price : "N/A",
                      numberProduct: product.numberProduct, // Include the quantity from the order
                    };
                  }
                  return null; // Return null if product details not fetched
                })
              );

              // Filter out null values in case of failed product fetches
              const validProductDetails = productDetails.filter(Boolean);

              // Merge product details with order data
              return {
                ...order,
                products: validProductDetails, // Add the detailed products
                phoneContact: user.number,
                paymentMethod:
                  order.paymentMethod === "cash"
                    ? "Thanh toán khi nhận hàng"
                    : "ZaloPay",
              };
            })
          );

          setOrders(detailedOrders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersWithDetails();
  }, [user._id, user.access_token]);

  useEffect(() => {
    console.log("Orders", orders);
  }, [orders]);

  const paidOrders = orders
    .filter(
      (order) => order.payment === true && !order.isCancel && !order.tradeStatus
    )
    .sort((a, b) => new Date(b.dateTrade) - new Date(a.dateTrade)); // Sắp xếp từ mới nhất đến cũ nhất

  const unpaidOrders = orders
    .filter(
      (order) =>
        order.payment === false && !order.isCancel && !order.tradeStatus
    )
    .sort((a, b) => new Date(b.dateTrade) - new Date(a.dateTrade)); // Sắp xếp từ mới nhất đến cũ nhất

  const canceledOrders = orders
    .filter((order) => order.isCancel === true && !order.tradeStatus)
    .sort((a, b) => new Date(b.dateTrade) - new Date(a.dateTrade)); // Sắp xếp từ mới nhất đến cũ nhất

  const completed = orders
    .filter((order) => order.tradeStatus === true && !order.isCancel)
    .sort((a, b) => new Date(b.dateTrade) - new Date(a.dateTrade)); // Sắp xếp từ

  const displayedOrders =
    activeTab === "paid"
      ? paidOrders
      : activeTab === "unpaid"
      ? unpaidOrders
      : activeTab === "canceled"
      ? canceledOrders
      : completed;

  const handleOrderDetails = (order) => {
    console.log("Viewing order details", order);
    setSelectedOrder(order);
    setCurrentProductIndex(0);
    setModalOpen(true);
  };

  const handleCancelOrder = async (tradeId) => {
    if (selectedOrder.sellerAccept === true) {
      alert("Đơn hàng đã được xác nhận, không thể huỷ");
      return;
    }

    console.log("Canceling order", tradeId);

    const formData = {
      tradeId: tradeId,
      buyer: user._id,
      seller: selectedOrder.seller,
      balence: selectedOrder.balence,
    };

    try {
      const response = await cancelTradeAPI(formData, user.access_token);
      console.log(response);
      setModalOpen(false);

      window.location.reload();
    } catch (error) {
      console.error("Failed to cancel the order:", error);
    }
  };

  const handlePurchaseOrder = async () => {
    const paymenData = {
      tradeId: [selectedOrder.tradeId],
      method: "zalo",
    };
    console.log("Adding trade:", paymenData);
    try {
      const paymentResponse = await tradePaymentAPI(
        paymenData,
        user.access_token
      );
      console.log("Payment response:", paymentResponse.data);
      setPaymentUrl(paymentResponse.data.order_url);
      const { order_url } = paymentResponse.data;
      if (order_url) {
        window.location.href = order_url;
      }
    } catch (error) {
      console.error("Error adding trade:", error);
    }
  };

  const handleRecievedOrder = async (tradeId) => {
    setLoading(true);
    try {
      const response = await getUpdateTradeStatusAPI(
        { tradeId },
        user.access_token
      );
      console.log(response);
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setLoading(false);
      setModalOpen(false);
      window.location.reload();
    }
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleSortClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // const currentProduct = selectedOrder?.products[currentProductIndex];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {loading && <Loading />}
      <div className="order-list">
        <div className=" bg-white p-6 rounded-lg shadow-lg">
          {/* Header with Tabs (Styled like navigation bar) */}
          <div className="flex border-b-2 border-gray-300 mb-6">
            <div
              onClick={() => setActiveTab("paid")}
              className={`py-3 px-6 cursor-pointer  whitespace-nowrap hidden md:inline ${
                activeTab === "paid"
                  ? "border-b-4 border-blue-500 text-blue-500"
                  : "text-gray-600"
              }`}
            >
              Đã Thanh Toán
            </div>
            <div
              onClick={() => setActiveTab("unpaid")}
              className={`py-3 px-6 cursor-pointer  whitespace-nowrap hidden md:inline ${
                activeTab === "unpaid"
                  ? "border-b-4 border-blue-500 text-blue-500"
                  : "text-gray-600"
              }`}
            >
              Chưa Thanh Toán
            </div>
            <div
              onClick={() => setActiveTab("canceled")}
              className={`py-3 px-6 cursor-pointer  whitespace-nowrap hidden md:inline ${
                activeTab === "canceled"
                  ? "border-b-4 border-blue-500 text-blue-500"
                  : "text-gray-600"
              }`}
            >
              Đã Huỷ
            </div>
            <div
              onClick={() => setActiveTab("completed")}
              className={`py-3 px-6 cursor-pointer  whitespace-nowrap hidden md:inline ${
                activeTab === "completed"
                  ? "border-b-4 border-blue-500 text-blue-500"
                  : "text-gray-600"
              }`}
            >
              Hoàn Thành
            </div>

            {/* Hiện khi reponsive là md trở xuống, để hiển thị ra option được chọn trong dropdown */}
            <div className="flex justify-between items-center w-full">
              <div
                className={`py-3 px-6 cursor-pointer whitespace-nowrap inline md:hidden ${
                  activeTab === "paid"
                    ? "border-b-4 border-blue-500 text-blue-500"
                    : activeTab === "unpaid"
                    ? "border-b-4 border-blue-500 text-blue-500"
                    : "border-b-4 border-blue-500 text-blue-500"
                }`}
              >
                {activeTab === "paid" && "Đã Thanh Toán"}
                {activeTab === "unpaid" && "Chưa Thanh Toán"}
                {activeTab === "canceled" && "Đã Huỷ"}
                {activeTab === "completed" && "Hoàn Thành"}
              </div>

              {/* reponsive dropdown for sort */}
              <div className="inline md:hidden py-3 px-6 cursor-pointer whitespace-nowrap relative">
                <button
                  onClick={handleSortClick}
                  className="focus:outline-none"
                >
                  <SortIcon />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    <div
                      onClick={() => {
                        setActiveTab("paid");
                        setDropdownOpen(false);
                      }}
                      className={`py-2 px-4 cursor-pointer hover:bg-blue-500 hover:text-white ${
                        activeTab === "paid" ? "bg-blue-100" : ""
                      }`}
                    >
                      Đã Thanh Toán
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab("unpaid");
                        setDropdownOpen(false);
                      }}
                      className={`py-2 px-4 cursor-pointer hover:bg-blue-500 hover:text-white ${
                        activeTab === "unpaid" ? "bg-blue-100" : ""
                      }`}
                    >
                      Chưa Thanh Toán
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab("canceled");
                        setDropdownOpen(false);
                      }}
                      className={`py-2 px-4 cursor-pointer hover:bg-blue-500 hover:text-white ${
                        activeTab === "canceled" ? "bg-blue-100" : ""
                      }`}
                    >
                      Đã Huỷ
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab("completed");
                        setDropdownOpen(false);
                      }}
                      className={`py-2 px-4 cursor-pointer hover:bg-blue-500 hover:text-white ${
                        activeTab === "completed" ? "bg-blue-100" : ""
                      }`}
                    >
                      Hoàn Thành
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4 max-h-[475px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
            {displayedOrders?.map((order) => (
              <div
                key={order.tradeId}
                className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                {/* Left section with image and product details */}
                <div className="flex flex-col sm:flex-row sm:items-start  lg:items-center gap-4 w-full lg:w-auto">
                  <img
                    src={order.products[0].image}
                    alt={order.products[0].productName}
                    className="sm:w-32 sm:h-32 lg:w-16 lg:h-16 object-cover rounded-md mr-0 lg:mr-4"
                  />
                  <div className="">
                    <div className="sm:w-64">
                      {order.products.length > 1 ? (
                        <h3 className="text-lg truncate">
                          Đơn gộp {order.products.length} sản phẩm
                        </h3>
                      ) : (
                        <h3 className="text-lg truncate">
                          {order.products[0].productName}
                        </h3>
                      )}
                      <p className="text-sm text-gray-500">
                        Mã đơn: {order.tradeId}
                      </p>
                      <p className="font-bold">
                        {order.balence >= 1000
                          ? order.balence.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })
                          : `${order.balence} đ`}
                      </p>
                    </div>
                    {/* hiện khi reponsive là lg */}
                    <div className="lg:hidden">
                      {!order.isCancel && <p>{order.paymentMethod}</p>}
                      {order.sellerAccept && !order.isCancel && (
                        <p className="text-sm text-green-500  mt-1">
                          Đã Chấp Nhận Đơn Hàng
                        </p>
                      )}
                      {order.isCancel && (
                        <p className="text-sm text-red-500  mt-1">
                          Đơn Hàng Đã Huỷ
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right section with price and payment method */}
                <div className="hidden lg:flex flex-col lg:items-end mt-4 lg:mt-0 w-full lg:w-auto lg:text-right">
                  {!order.isCancel && <p>{order.paymentMethod}</p>}
                  {order.sellerAccept &&
                    !order.isCancel &&
                    !order.tradeStatus && (
                      <p className="text-sm text-green-500 mt-1">
                        Đã Chấp Nhận Đơn Hàng
                      </p>
                    )}
                  {order.sellerAccept &&
                    !order.isCancel &&
                    order.tradeStatus && (
                      <p className="text-sm text-green-500 mt-1">
                        Đơn Hàng Đã Hoàn Thành
                      </p>
                    )}
                  {order.isCancel && (
                    <p className="text-sm text-red-500 mt-1">Đơn Hàng Đã Huỷ</p>
                  )}
                </div>

                {/* Responsive buttons */}
                <div className="flex flex-col lg:items-center lg:justify-end mt-4 lg:mt-0 w-full lg:w-auto lg:self-end whitespace-nowrap">
                  <button
                    className="mt-2 lg:mt-0 lg:ml-4 transition duration-300"
                    onClick={() => handleOrderDetails(order)}
                  >
                    {/* Show icon on large screens, text on small screens */}
                    <span className="hidden lg:inline-flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-lg mb-4">
                      <VisibilityOutlinedIcon className="text-white text-xl" />
                    </span>
                    <span className="inline lg:hidden flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-lg">
                      Chi tiết đơn hàng
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="order-footer">
        <FooterSection />
      </div>

      {/* Modal for Order Details */}
      {selectedOrder && (
        <Modal open={isModalOpen} onClose={() => setModalOpen(false)}>
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-2 sm:p-8 rounded-lg shadow-lg w-[80%] sm:h-[78%] h-[95%] max-w-4xl overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
                {/* Left Column: Product Information */}
                <div className="space-y-2 sm:space-y-4 relative">
                  {/* Left Arrow */}
                  {currentProductIndex > 0 && (
                    <button
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                      onClick={() =>
                        setCurrentProductIndex(currentProductIndex - 1)
                      }
                    >
                      <KeyboardArrowLeftIcon />
                    </button>
                  )}

                  <p className="text-sm sm:text-base">
                    <strong>Tên sản phẩm:</strong>{" "}
                    {selectedOrder.products[currentProductIndex].productName}
                  </p>
                  <img
                    src={selectedOrder.products[currentProductIndex].image}
                    alt={
                      selectedOrder.products[currentProductIndex].productName
                    }
                    className="w-28 h-28 sm:w-48 sm:h-48 object-cover rounded-md mx-auto"
                  />
                  <p className="text-sm sm:text-base">
                    <strong>Thương hiệu:</strong>{" "}
                    {selectedOrder.products[currentProductIndex].brand}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Loại sản phẩm:</strong>{" "}
                    {selectedOrder.products[currentProductIndex].classify}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Giá:</strong>{" "}
                    {selectedOrder.products[currentProductIndex].price >= 1000
                      ? selectedOrder.products[
                          currentProductIndex
                        ].price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : `${selectedOrder.products[currentProductIndex].price} đ`}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Số lượng:</strong>{" "}
                    {selectedOrder.products[currentProductIndex].numberProduct}
                  </p>

                  {/* Right Arrow */}
                  {currentProductIndex < selectedOrder.products.length - 1 && (
                    <button
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                      onClick={() =>
                        setCurrentProductIndex(currentProductIndex + 1)
                      }
                    >
                      <KeyboardArrowRightIcon />
                    </button>
                  )}
                </div>

                {/* Right Column: Recipient and Order Status */}
                <div className="space-y-4">
                  <p className="text-sm sm:text-base">
                    <strong>Tổng tiền:</strong>{" "}
                    {selectedOrder.balence >= 1000
                      ? selectedOrder.balence.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : `${selectedOrder.balence} đ`}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Ngày đặt hàng:</strong> {selectedOrder.dateTrade}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Địa chỉ giao hàng:</strong>{" "}
                    {selectedOrder.buyersaddress}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Tên người nhận:</strong> {selectedOrder.buyersname}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Số điện thoại:</strong> {selectedOrder.phoneContact}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Email:</strong> {selectedOrder.buyersuserName}
                  </p>
                  <p className="text-sm sm:text-base">
                    <strong>Phương thức thanh toán:</strong>{" "}
                    {selectedOrder.paymentMethod}
                  </p>

                  {selectedOrder.isCancel && (
                    <p className="text-red-500">
                      <strong>Trạng thái:</strong> Đã huỷ
                    </p>
                  )}

                  {!selectedOrder.isCancel && !selectedOrder.tradeStatus && (
                    <button
                      className={`bg-red-500 text-white py-2 px-4 rounded-lg w-full mt-4 ${
                        selectedOrder.sellerAccept
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => handleCancelOrder(selectedOrder.tradeId)}
                    >
                      Huỷ đơn hàng
                    </button>
                  )}

                  {!selectedOrder.tradeStatus &&
                    !selectedOrder.isCancel &&
                    selectedOrder.sellerAccept && (
                      <button
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full mt-4"
                        onClick={() =>
                          handleRecievedOrder(selectedOrder.tradeId)
                        }
                      >
                        Đã nhận hàng
                      </button>
                    )}

                  {selectedOrder.sellerAccept &&
                    !selectedOrder.isCancel &&
                    !selectedOrder.tradeStatus && (
                      <p className="text-green-500 text-center">
                        Đơn hàng đã được chấp nhận.
                      </p>
                    )}

                  {selectedOrder.sellerAccept &&
                    !selectedOrder.isCancel &&
                    selectedOrder.tradeStatus && (
                      <p className="text-green-500 text-center">
                        Đơn hàng đã hoàn thành.
                      </p>
                    )}

                  {!selectedOrder.payment &&
                    !selectedOrder.isCancel &&
                    selectedOrder.paymentMethod === "ZaloPay" && (
                      <button
                        onClick={handlePurchaseOrder}
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full mt-4"
                      >
                        Thanh toán ngay
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default Orders;
