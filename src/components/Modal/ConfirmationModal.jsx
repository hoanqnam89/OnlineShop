import React from "react";
import "./Modal.css";

const ConfirmationModal = ({ onClose, onConfirm }) => (
  <div className="confirmation-modal">
    <div className="modal-content">
      <h3>Bạn có chắc muốn xoá không?</h3>
      <button onClick={onConfirm} className="confirm-button">
        Có
      </button>
      <button onClick={onClose} className="cancel-button">
        Không
      </button>
    </div>
  </div>
);

export default ConfirmationModal;
