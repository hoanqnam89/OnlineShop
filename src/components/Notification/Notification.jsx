import React, { useEffect } from "react";
import "./Notification.css";
import { useState } from "react";

const Notification = ({ message, onClose, status }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500); // Wait for fade-out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getStatusClass = () => {
    switch (status) {
      case "error":
        return "notification-error";
      case "success":
        return "notification-success";
      default:
        return "notification-default";
    }
  };

  return (
    <div
      className={`notification-bar ${getStatusClass()} ${
        visible ? "show" : "fade-out"
      }`}
    >
      {message}
    </div>
  );
};

export default Notification;
