import React from "react";

const OrderStatusModal = ({ isOpen, onClose, orderDetails }) => {
  if (!isOpen) return null;

  const order = {
    orderId: "ORD123456",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white w-11/12 md:w-1/3 p-6 rounded-lg shadow-lg relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Trạng thái đơn hàng
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            &times;
          </button>
        </div>

        {/* Payment Confirmation */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-green-600">
            Thanh toán thành công
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Mã đơn hàng: <span className="font-medium">{order.orderId}</span>
          </p>
        </div>

        {/* Order Process */}
        <div className="space-y-10 relative">
          {/* Vertical line connecting steps */}
          <div className="absolute top-8 left-5 w-0.5 h-full bg-gray-300"></div>

          {/* Payment Status */}
          <div className="flex items-center space-x-4 relative">
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-xl relative z-10">
              ✓
            </div>
            <div>
              <p className="text-base font-medium">Đã thanh toán</p>
              <p className="text-sm text-gray-500">
                Thanh toán của bạn đã được xác nhận
              </p>
            </div>
          </div>

          {/* Packaging Status */}
          <div className="flex items-center space-x-4 relative">
            <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center relative z-10">
              <div className="animate-spin">⏳</div>
            </div>
            <div>
              <p className="text-base font-medium">Đang đóng gói</p>
              <p className="text-sm text-gray-500">
                Sản phẩm của bạn đang được đóng gói
              </p>
            </div>
          </div>

          {/* Shipping Status */}
          <div className="flex items-center space-x-4 relative">
            <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center relative z-10">
              <div className="animate-spin">🚚</div>
            </div>
            <div>
              <p className="text-base font-medium">Đang vận chuyển</p>
              <p className="text-sm text-gray-500">
                Sản phẩm đang trên đường tới bạn
              </p>
            </div>
          </div>

          {/* Delivered Status */}
          <div className="flex items-center space-x-4 relative">
            <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center relative z-10">
              📦
            </div>
            <div>
              <p className="text-base font-medium">Đang chờ giao hàng</p>
              <p className="text-sm text-gray-500">
                Sản phẩm của bạn sắp được giao
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition focus:outline-none"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusModal;
