import React, { useEffect } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import OrderStatusModal from "../OrderStatus/OrderStatusModal";
import { addTradeAPI, tradePaymentAPI } from "../../api/tradeAPI";
import OrderSuccessModal from "../Modal/OrderSuccessModal";
import Loading from "../Loading/Loading";

const PurchaseModal = ({
  isOpen,
  onClose,
  product,
  onShowSuccessOrderModal,
}) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [discountCode, setDiscountCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");

  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const orderDetails = {
    orderId: "ORD123456",
    paymentStatus: "success",
    packingStatus: "inProgress",
    shippingStatus: "pending",
  };

  if (!isOpen) return null;

  const handleApplyDiscount = () => {
    console.log("Applying discount code:", discountCode);
  };

  const handleViewDiscounts = () => {
    console.log("Viewing available discounts");
  };

  const handleContinuePurchase = async () => {
    const formData = {
      buyer: user._id,
      products: [
        {
          seller: product.seller,
          items: [
            {
              productId: product.productId,
              classifyId: product.classify._id,
              numberProduct: product.numberProduct,
            },
          ],
        },
      ],
      paymentMethod: paymentMethod,
      address: user.address,
      from: "product",
    };
    setLoading(true);
    try {
      console.log("Adding trade:", formData);
      // Gọi API thêm tradeId
      const tradeResponse = await addTradeAPI(formData, user.access_token);
      if (tradeResponse.status === 201) {
        console.log("Trade added successfully:", tradeResponse.data);
        const tradeId = tradeResponse.data.tradeId;

        // Nếu thanh toán bằng tiền mặt khi nhận hàng
        if (paymentMethod === "cash") {
          onClose();
          onShowSuccessOrderModal();
        }

        // Nếu thanh toán bằng Zalo Pay
        if (paymentMethod === "zalo") {
          const paymentData = {
            tradeId: tradeId,
            method: "zalo",
          };
          const paymentResponse = await tradePaymentAPI(
            paymentData,
            user.token
          );
          console.log("Payment response:", paymentResponse.data);
          setPaymentUrl(paymentResponse.data.order_url);
          const { order_url } = paymentResponse.data;
          if (order_url) {
            window.location.href = order_url;
          }
        }
      }
    } catch (error) {
      console.error("Error adding trade:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        {loading && <Loading />}

        <div className="bg-white rounded-lg shadow-lg max-w-xl w-full h-[98vh] p-5 overflow-hidden overflow-y-auto ">
          <h2 className="text-xl font-semibold mb-3">Xác Nhận Mua Hàng</h2>

          <div className="flex items-center mb-3">
            <img
              src={product?.image}
              alt={product?.productName}
              className="w-24 h-24 object-cover rounded-md"
            />
            <div className="ml-4">
              <p className="font-semibold text-lg">
                {product.productName || "Product Name"}
              </p>
              <div className="text-gray-600 mt-1">
                <span className="text-red-500 font-bold">
                  {product?.classify.price >= 1000
                    ? product?.classify.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })
                    : `${product?.classify.price} đ`}
                </span>
                <div className="text-sm text-gray-500">
                  Kích cỡ: {product?.classify.value}
                </div>
                <div className="text-sm text-blue-500 mt-1">
                  <a href="#">{product?.brand}</a>
                </div>
              </div>
            </div>
          </div>

          {/* Số lượng and Tổng giá in one row */}
          <div className="flex justify-between mb-3">
            <span className="font-medium">
              Số lượng: {product.numberProduct}
            </span>
            <span className="font-medium">
              Tổng giá:{" "}
              {product.price >= 1000
                ? product.price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })
                : `${product.price} đ`}
            </span>
          </div>

          {/* Địa chỉ giao hàng */}
          <div className="mb-3">
            <span className="font-medium">Địa chỉ giao hàng:</span>
            <p className="text-gray-600">{user.address}</p>
          </div>

          {/* Số điện thoại in one row */}
          <div className="flex justify-between mb-3">
            <span className="font-medium">Số điện thoại:</span>
            <p className="text-gray-600">{user.number}</p>
          </div>

          {/* Tiền vận chuyển in one row */}
          <div className="flex justify-between mb-3">
            <span className="font-medium">Tiền vận chuyển:</span>
            <span className="text-gray-600">0đ</span>
          </div>

          {/* Giảm giá in one row */}
          <div className="flex justify-between mb-3">
            <span className="font-medium">Giảm giá:</span>
            <span className="text-gray-600">0đ</span>
          </div>

          <div className="mb-3 flex">
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="border rounded-md p-2 flex-grow mr-2"
            />
            <button
              onClick={handleApplyDiscount}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Áp dụng
            </button>
          </div>

          <div
            className="text-blue-500 cursor-pointer underline mb-3"
            onClick={handleViewDiscounts}
          >
            Xem mã giảm giá đang có
          </div>

          {/* Thành Tiền in one row */}
          <div className="flex justify-between mb-3">
            <span className="font-medium">Thành Tiền:</span>
            <span className="text-red-500 font-bold">
              {product.price >= 1000
                ? product.price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })
                : `${product.price} đ`}
            </span>
          </div>

          <div className="mb-6">
            <span className="font-medium">Phương thức thanh toán:</span>
            <div className="mt-2 flex space-x-4">
              <button
                className={`border px-4 py-2 rounded-md ${
                  paymentMethod === "cash"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setPaymentMethod("cash")}
              >
                Thanh toán khi nhận hàng
              </button>
              <button
                className={`border px-4 py-2 rounded-md ${
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

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded-md"
            >
              Huỷ
            </button>
            <button
              onClick={handleContinuePurchase}
              className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
                !paymentMethod ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!paymentMethod}
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

          <OrderStatusModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            orderDetails={orderDetails}
          />
        </div>
      </div>
    </>
  );
};

export default PurchaseModal;
