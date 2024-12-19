import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from "react";
import {
  acceptTradeAPI,
  cancelTradeAPI,
  getTradeBySellerAPI,
} from "../../../../api/tradeAPI";
import { getProductById } from "../../../../api/productAPI";
import Loading from "../../../../components/Loading/Loading";
import CachedIcon from "@mui/icons-material/Cached";

const MultipleOrderList = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrdersWithDetails();
  }, [user._id, user.access_token]);

  const fetchOrdersWithDetails = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await getTradeBySellerAPI(
        user._id,
        user.access_token
      );
      if (fetchedOrders.status === 200) {
        console.log("Fetch orders", fetchedOrders.data);

        const detailedOrders = await Promise.all(
          fetchedOrders.data
            .filter((order) => order.products.length > 1)
            .filter(
              (order) =>
                (order.paymentMethod === "zalo" && order.payment === true) ||
                order.paymentMethod === "cash"
            )
            .map(async (order) => {
              const productDetails = await Promise.all(
                order.products.map(async (product) => {
                  const productResponse = await getProductById(
                    product.productId
                  );
                  if (productResponse.status === 200) {
                    const productData = productResponse.data[0];

                    const classify = productData.classifies?.find(
                      (c) => c._id === product.classifyId
                    );

                    return {
                      productName: productData.productName,
                      image: productData.images?.[0] || "",
                      brand: productData.brand,
                      category: productData.category,
                      classify: classify ? classify.value : "N/A",
                      price: classify ? classify.price : "N/A",
                      numberProduct: product.numberProduct,
                    };
                  }
                  return null;
                })
              );

              const formattedDate = new Date(
                order.dateTrade
              ).toLocaleDateString("en-GB");
              const formattedTime = new Date(
                order.dateTrade
              ).toLocaleTimeString("en-GB");

              return {
                ...order,
                productsDetails: productDetails, // Store all product details
                formattedDate,
                formattedTime,
                phoneContact: user.number,
                status: order.isCancel
                  ? "Canceled"
                  : order.sellerAccept
                  ? "Approval"
                  : "Pending",
                statusColor: order.isCancel
                  ? "text-red-500"
                  : order.sellerAccept
                  ? "text-green-500"
                  : "text-yellow-500",
                paymentMethod:
                  order.paymentMethod == "cash"
                    ? "Thanh toán khi nhận hàng"
                    : "ZaloPay",
              };
            })
        );
        const sortedOrders = detailedOrders.sort(
          (a, b) => new Date(b.dateTrade) - new Date(a.dateTrade)
        );
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on status and date range
  const filteredOrders = orders.filter((order) => {
    const statusMatch =
      selectedStatus === "All" || order.status === selectedStatus;

    // Convert order date string to Date object
    const orderDate = new Date(
      order.formattedDate.split("/").reverse().join("-")
    ); // Chuyển đổi từ dd/mm/yyyy sang yyyy-mm-dd
    const fromDate = selectedDateRange.from
      ? new Date(selectedDateRange.from)
      : null;
    const toDate = selectedDateRange.to ? new Date(selectedDateRange.to) : null;

    // Check if order date is within the selected date range
    const dateMatch =
      (!fromDate || orderDate >= fromDate) && (!toDate || orderDate <= toDate);

    return statusMatch && dateMatch;
  });

  // Handle showing modal with order details
  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleAcceptedOrder = async () => {
    setLoading(true);
    try {
      console.log(selectedOrder.tradeId);

      const response = await acceptTradeAPI(
        { tradeId: selectedOrder.tradeId },
        user.access_token
      );
      console.log("Accepted trade", response);
      if (response.status === 201) {
        const updatedOrders = orders.map((order) => {
          if (order.tradeId === selectedOrder.tradeId) {
            return {
              ...order,
              status: "Approval",
              statusColor: "text-green-500",
            };
          }
          return order;
        });
        setOrders(updatedOrders);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error accept trade:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectedOrder = async (tradeId) => {
    // Create a clean, serializable version of the order
    const formData = {
      tradeId: selectedOrder.tradeId,
      buyer: selectedOrder.buyerId,
      seller: selectedOrder.sellerId,
      balance: selectedOrder.balence,
    };

    // Log formData to verify it is clean and serializable
    console.log("Clean formData:", formData);

    try {
      const response = await cancelTradeAPI(formData, user.access_token);
      console.log("Cancel trade", response);
      if (response.status === 201) {
        const updatedOrders = orders.map((order) => {
          if (order.tradeId === selectedOrder.tradeId) {
            return {
              ...order,
              status: "Canceled",
              statusColor: "text-red-500",
            };
          }
          return order;
        });
        setOrders(updatedOrders);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error cancel trade:", error);
    }
  };

  const handleReload = () => {
    // Reset filters
    setSelectedStatus("All");
    setSelectedDateRange({
      from: "",
      to: "",
    });

    // Re-fetch orders
    fetchOrdersWithDetails();
  };

  return (
    <div className="p-6">
      {loading && <Loading />}
      <h2 className="text-2xl font-semibold mb-4">Multiple Order List</h2>

      {/* Filter Section */}
      <div className="flex justify-between mb-4">
        {/* Status Filter */}
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              selectedStatus === "All"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setSelectedStatus("All")}
          >
            Tất Cả
          </button>
          <button
            className={`px-4 py-2 rounded ${
              selectedStatus === "Approval"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setSelectedStatus("Approval")}
          >
            Approval
          </button>
          <button
            className={`px-4 py-2 rounded ${
              selectedStatus === "Pending"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setSelectedStatus("Pending")}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded ${
              selectedStatus === "Canceled"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setSelectedStatus("Canceled")}
          >
            Canceled
          </button>
          <button
            className={`px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 active:bg-blue-500 active:text-white`}
            onClick={handleReload}
          >
            <CachedIcon />
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label className="mr-2">Từ:</label>
            <input
              type="date"
              className="border border-gray-300 rounded p-2"
              value={selectedDateRange.from}
              onChange={(e) =>
                setSelectedDateRange({
                  ...selectedDateRange,
                  from: e.target.value,
                })
              }
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2">Đến:</label>
            <input
              type="date"
              className="border border-gray-300 rounded p-2"
              value={selectedDateRange.to}
              onChange={(e) =>
                setSelectedDateRange({
                  ...selectedDateRange,
                  to: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Order Table */}
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-4 border-b">Order ID</th>
            {/* <th className="p-4 border-b">Tên Sản Phẩm</th> */}
            {/* <th className="p-4 border-b">Category</th> */}
            <th className="p-4 border-b">Địa Chỉ Giao Hàng</th>
            <th className="p-4 border-b">Ngày Đặt</th>
            <th className="p-4 border-b">Giá Tiền</th>
            <th className="p-4 border-b">Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.tradeId} className="hover:bg-gray-50">
              <td
                className="p-4 border-b cursor-pointer"
                onClick={() => handleShowDetails(order)}
              >
                {order.tradeId}
              </td>

              <td className="p-4 border-b truncate max-w-xs">
                {order.buyersaddress}
              </td>
              <td className="p-4 border-b">
                {order.formattedDate} {order.formattedTime}
              </td>
              <td className="p-4 border-b">
                {order.balence >= 1000
                  ? order.balence.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })
                  : `${order.balence} đ`}
              </td>
              <td className={`p-4 border-b ${order.statusColor}`}>
                {order.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Order Details */}
      {showModal && selectedOrder && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          aria-labelledby="order-details-modal"
          aria-describedby="order-details-description"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="p-6 bg-white rounded-lg shadow-xl max-w-3xl w-full relative">
              <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent p-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">
                    Thông tin chi tiết đơn hàng
                  </h3>
                  <CloseIcon
                    className="text-red-500 cursor-pointer"
                    onClick={() => setShowModal(false)}
                    size={24}
                  />
                </div>

                {/* Buyer Information Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-600 mb-4 border-b pb-2">
                    Thông tin người mua
                  </h4>
                  <div className="grid grid-cols-[2fr,1fr] gap-4">
                    <div>
                      <strong className="text-sm">Tên người đặt:</strong>{" "}
                      {selectedOrder.buyersname}
                    </div>
                    <div>
                      <strong className="text-sm">Phone:</strong>{" "}
                      {selectedOrder.phoneContact}
                    </div>
                    <div>
                      <strong className="text-sm">Địa chỉ giao hàng:</strong>{" "}
                      {selectedOrder.buyersaddress}
                    </div>
                    <div>
                      <strong className="text-sm">Email:</strong>{" "}
                      {selectedOrder.buyersuserName}
                    </div>
                  </div>
                </div>

                {/* Order Details Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-600 mb-2 border-b pb-2">
                    Thông tin đơn hàng
                  </h4>
                  <div className="grid grid-cols-[2fr,1fr] gap-4 pb-6">
                    <div>
                      <strong className="text-sm">Order ID:</strong>{" "}
                      {selectedOrder.tradeId}
                    </div>
                    <div className={`${selectedOrder.statusColor}`}>
                      <strong className="text-sm">Trạng thái:</strong>{" "}
                      {selectedOrder.status}
                    </div>
                    <div>
                      <strong className="text-sm">Ngày đặt:</strong>{" "}
                      {selectedOrder.formattedDate}{" "}
                      {selectedOrder.formattedTime}
                    </div>
                    <div>
                      <strong className="text-sm">Tổng:</strong>{" "}
                      {selectedOrder.balence >= 1000
                        ? selectedOrder.balence.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })
                        : `${selectedOrder.balence} đ`}
                    </div>
                  </div>

                  {/* Multiple Products Display */}
                  <div className="mb-2 pt-4">
                    <h4 className="text-lg font-semibold text-gray-600 mb-2 border-b pb-2">
                      Thông tin Sản Phẩm
                    </h4>
                    {selectedOrder.productsDetails.map((product, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[2fr,1fr] gap-4 pb-3"
                      >
                        <div>
                          <div>
                            <strong className="text-sm">Tên Sản Phẩm:</strong>{" "}
                            {product.productName}
                          </div>
                          <div>
                            <strong className="text-sm">Loại Sản Phẩm:</strong>{" "}
                            {product.classify}
                          </div>
                        </div>
                        <div>
                          <div>
                            <strong className="text-sm">Giá Tiền:</strong>{" "}
                            {product.price >= 1000
                              ? product.price.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })
                              : `${product.price} đ`}
                          </div>
                          <div>
                            <strong className="text-sm">Số Lượng:</strong>{" "}
                            {product.numberProduct}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method Section */}
                <div className="text-lg mb-4 border-t pt-2 pb-10 italic">
                  <strong className="text-sm">Phương thức thanh toán:</strong>{" "}
                  {selectedOrder.paymentMethod}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white shadow-lg flex justify-end space-x-4">
                {selectedOrder.status === "Pending" && (
                  <button
                    onClick={handleAcceptedOrder}
                    className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-700"
                  >
                    Approval
                  </button>
                )}
                {selectedOrder.status === "Pending" && (
                  <button
                    onClick={handleRejectedOrder}
                    className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MultipleOrderList;
