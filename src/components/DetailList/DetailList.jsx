import React from "react";
import "./DetailList.css";

const DetailList = ({ details }) => {
  // Nhóm các mục theo key
  const groupedDetails = details.reduce((acc, detail) => {
    if (!acc[detail.key]) {
      acc[detail.key] = [];
    }
    acc[detail.key].push(detail.value);
    return acc;
  }, {});

  // Tạo danh sách mới từ groupedDetails
  const mergedDetails = Object.entries(groupedDetails).map(([key, values]) => ({
    key,
    value: values.join("<br />"), // Nối các value với thẻ <br />
  }));

  return (
    <div className="detail-list">
      {mergedDetails.map((detail, index) => (
        <div key={index} className="detail-item">
          <span className="detail-key">{detail.key}</span>
          <span
            className="detail-value"
            dangerouslySetInnerHTML={{ __html: detail.value }}
          ></span>
        </div>
      ))}
    </div>
  );
};

export default DetailList;
