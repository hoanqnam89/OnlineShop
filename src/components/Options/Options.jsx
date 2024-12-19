import React, { useEffect, useState } from "react";
import "./Options.css";
import ListIcon from "@mui/icons-material/List";

const Options = ({ width }) => {
  // State to manage dropdown visibility for mobile view
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen width is below a certain threshold

  useEffect(() => {
    if (width <= 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, [width]);

  // Toggle dropdown menu visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div className="options-container">
      <div className="options-header">
        <h2>Options</h2>
        <p>Chọn Lựa Chọn Của Bạn</p>
      </div>

      {isMobile ? (
        // Mobile view with a dropdown menu
        <>
          <button className="options-button" onClick={toggleDropdown}>
            <div className="dropdown-icon">
              <ListIcon />
            </div>
          </button>
          {isDropdownOpen && (
            <ul className="options-list dropdown">
              <li className="options-items">
                <a className="options-link" href="/bank">
                  Thanh Toán
                </a>
              </li>
              <li className="options-items">
                <a className="options-link" href="/voucher">
                  Voucher
                </a>
              </li>
              <li className="options-items">
                <a className="options-link" href="/bill">
                  Hoá Đơn
                </a>
              </li>
              <li className="options-items">
                <a className="options-link" href="/forgotPass">
                  Quên Mật Khẩu
                </a>
              </li>
            </ul>
          )}
        </>
      ) : (
        // Desktop view with a list of options
        <ul className="options-list">
          <li className="options-items">
            <a className="options-link" href="/bank">
              Thanh Toán
            </a>
          </li>
          <li className="options-items">
            <a className="options-link" href="/address">
              Địa chỉ
            </a>
          </li>
          <li className="options-items">
            <a className="options-link" href="/voucher">
              Voucher
            </a>
          </li>
          <li className="options-items">
            <a className="options-link" href="/bill">
              Hoá Đơn
            </a>
          </li>
          <li className="options-items">
            <a className="options-link" href="/forgotPass">
              Quên Mật Khẩu
            </a>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Options;
