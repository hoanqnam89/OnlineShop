const OrderSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mb-4">
          {/* Rotating circles animation */}
          <div className="relative flex justify-center items-center">
            {/* <div className="absolute animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500"></div> */}
            <div className="absolute animate-spin rounded-full h-24 w-24 border-t-4 border-green-500"></div>

            {/* Green checkmark centered */}
            <svg
              className="relative z-10 h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <p className="text-lg font-semibold mt-3 p-4">Đặt hàng thành công</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
