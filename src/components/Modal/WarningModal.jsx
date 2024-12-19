import React from "react";
import { useNavigate } from "react-router-dom";

const WarningModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Thông báo</h2>
        <p className="mb-4">
          Vui lòng cập nhật đầy đủ thông tin cá nhân trước khi mua hàng!
        </p>
        <button
          onClick={() => navigate("/profile")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Cập nhật
        </button>
      </div>
    </div>
  );
};

export default WarningModal;
