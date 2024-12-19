import React, { useEffect, useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import { getAllCate } from "../../../../api/cateAPI";
import {
  addClassifyAPI,
  updateClassifyAPI,
  updateProductAPI,
  uploadFile,
} from "../../../../api/productAPI";
import {
  addAttributeAPI,
  deleteAttributeAPI,
  updateAttributeAPI,
} from "../../../../api/attriAPI";
import {
  addDescriptionAPI,
  deleteDescriptionAPI,
  updateDescriptionAPI,
} from "../../../../api/descriptAPI";
import { useSelector } from "react-redux";
import UploadComponent from "../../../../components/Dropzone/UploadComponent";
import RemoveIcon from "@mui/icons-material/Remove";
import Loading from "../../../../components/Loading/Loading";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const UpdateProduct = ({ product, setActiveTab }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [productDetails, setProductDetails] = useState({
    productName: product?.productName || "",
    category: product?.categories[0]?._id || "",
    brand: product?.brand || "",
  });

  const [loading, setLoading] = useState(false);

  const [previewImages, setPreviewImages] = useState([]);
  const [oldImages, setOldImages] = useState(product?.images || []);
  const [newImages, setNewImages] = useState([]);

  const [categories, setCategories] = useState([]);
  const [classifies, setClassifies] = useState(product?.classifies || []);
  const [attributes, setAttributes] = useState(product?.attributes || []);
  const [descriptions, setDescriptions] = useState(product?.decriptions || []);

  const [showMessagePro, setShowMessagePro] = useState(false);
  const [showMessageClassify, setShowMessageClassify] = useState(false);
  const [showMessageAttri, setShowMessageAttri] = useState(false);
  const [showMessageDes, setShowMessageDes] = useState(false);
  const [messageProduct, setMessageProduct] = useState("");
  const [messageClassify, setMessageClassify] = useState("");
  const [messageAttribute, setMessageAttribute] = useState("");
  const [messageDescription, setMessageDescription] = useState("");

  const classifySuggestions = [
    "Kích thước",
    "Chất liệu",
    "Loại sản phẩm",
    "Phân loại",
    "Loại vải",
    "Loại da",
    "Kiểu dáng",
    "Màu sắc",
  ];
  const attributeSuggestions = [
    "Nơi sản xuất",
    "Xuất sứ",
    "Nhà sản xuất",
    "Bảo hành",
    "Chất liệu",
    "Màu sắc",
    "Kích thước",
    "Cân nặng",
    "Ram",
    "CPU",
    "Bộ nhớ",
    "Màn hình",
    "Camera",
    "Pin",
    "Hệ điều hành",
    "Chipset",
    "GPU",
    "Bộ nhớ trong",
    "Bộ nhớ ngoài",
    "Loại pin",
    "Dung lượng",
    "Chất liệu",
    "Màu sắc",
    "Hạn sử dụng",
  ];
  const descriptionSuggestions = [
    "Mô tả sản phẩm",
    "Thông tin sản phẩm",
    "Cách dùng",
    "Hướng dẫn sử dụng",
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getAllCate();
      setCategories(response.data);
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e, setState, field) => {
    setState((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleDrop = (files) => {
    const previewUrls = [];
    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.push(previewUrl);
    }
    setPreviewImages([...previewImages, ...previewUrls]);
    setNewImages([...newImages, ...files]);
  };

  // Xóa ảnh cũ
  const removeOldImage = (index) => {
    const updatedOldImages = oldImages.filter((_, i) => i !== index);
    setOldImages(updatedOldImages);
  };

  // Xóa ảnh mới (chỉ là preview chưa upload)
  const removeNewImage = (index) => {
    const updatedPreviewImages = previewImages?.filter((_, i) => i !== index);
    const updatedNewImages = newImages.filter((_, i) => i !== index);
    setPreviewImages(updatedPreviewImages);
    setNewImages(updatedNewImages);
  };

  // Function to update product
  const handleUpdateProduct = async () => {
    if (
      !productDetails.productName ||
      productDetails.productName.trim() === ""
    ) {
      setMessageProduct("Tên sản phẩm không được để trống.");
      setShowMessagePro(true);
      setTimeout(() => {
        setShowMessagePro(false);
      }, 1500);
      return;
    }

    if (!productDetails.brand || productDetails.brand.trim() === "") {
      setMessageProduct("Thương hiệu không được để trống.");
      setShowMessagePro(true);
      setTimeout(() => {
        setShowMessagePro(false);
      }, 1500);
      return;
    }

    if (newImages.length === 0 && oldImages.length === 0) {
      setMessageProduct("Ảnh sản phẩm không được để trống.");
      setShowMessagePro(true);
      setTimeout(() => {
        setShowMessagePro(false);
      }, 1500);
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      for (const file of newImages) {
        formData.append("files", file);
      }

      // Call API to upload new images to S3
      const response = await uploadFile(formData);
      const imageUrls = response?.data;

      const updatedImages = [...oldImages, ...imageUrls];

      const responseUpdate = await updateProductAPI(
        {
          id: product._id,
          productName: productDetails.productName,
          cate: productDetails.category,
          brand: productDetails.brand,
          seller: user._id,
          images: updatedImages,
        },
        user.access_token
      );
      if (responseUpdate.status === 201) {
        setMessageProduct("Cập nhật sản phẩm thành công");
        setShowMessagePro(true);
        setTimeout(() => {
          setShowMessagePro(false);
        }, 1500);
      } else {
        setMessageProduct("Cập nhật sản phẩm thất bại");
        setShowMessagePro(true);
        setTimeout(() => {
          setShowMessagePro(false);
        }, 1500);
      }
    } catch (error) {
      setMessageProduct("Có lỗi khi cập nhật sản phẩm");
      setShowMessagePro(true);
      setTimeout(() => {
        setShowMessagePro(false);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  // Function to update classifies
  const handleUpdateClassifies = async () => {
    setLoading(true);
    for (const classify of classifies) {
      if (
        !classify.key ||
        !classify.value ||
        classify.price === undefined ||
        classify.price < 0
      ) {
        setMessageClassify(
          "Vui lòng nhập đầy đủ thông tin cho tất cả các mục phân loại."
        );
        setShowMessageClassify(true);
        setTimeout(() => {
          setShowMessageClassify(false);
        }, 2000);
        setLoading(false);
        return;
      }
    }
    try {
      for (let i = 0; i < classifies.length; i++) {
        const newStock = classifies[i].newStock || 0;
        const classifyData = {
          id: classifies[i]._id,
          key: classifies[i].key,
          value: classifies[i].value,
          price: classifies[i].price,
          stock: newStock,
          product: product._id,
        };
        if (classifies[i]._id) {
          const response = await updateClassifyAPI(
            classifyData,
            user.access_token
          );
        } else {
          const response = await addClassifyAPI(
            classifyData,
            user.access_token
          );
        }
      }
      setMessageClassify("Cập nhật phân loại thành công");
      setShowMessageClassify(true);
      setTimeout(() => {
        setShowMessageClassify(false);
      }, 1500);
    } catch (error) {
      setMessageClassify("Có lỗi khi cập nhật phân loại");
    } finally {
      setLoading(false);
    }
  };

  // Function to update attributes
  const handleUpdateAttributes = async () => {
    setLoading(true);
    for (const attribute of attributes) {
      if (!attribute.key || !attribute.value) {
        setMessageAttribute(
          "Vui lòng nhập đầy đủ thông tin cho tất cả các mục thuộc tính."
        );
        setShowMessageAttri(true);
        setTimeout(() => {
          setShowMessageAttri(false);
        }, 2000);
        setLoading(false);
        return;
      }
    }

    try {
      for (let i = 0; i < attributes.length; i++) {
        const attributeData = {
          key: attributes[i].key,
          value: attributes[i].value,
        };
        if (attributes[i]._id) {
          attributeData.id = attributes[i]._id;
          attributeData.product = product._id;
          const response = await updateAttributeAPI(
            attributeData,
            user.access_token
          );
        } else {
          attributeData.productId = product._id;
          const response = await addAttributeAPI(
            attributeData,
            user.access_token
          );
        }
      }
      setMessageAttribute("Cập nhật thuộc tính thành công");
      setShowMessageAttri(true);
      setTimeout(() => {
        setShowMessageAttri(false);
      }, 1500);
    } catch (error) {
      setMessageAttribute("Có lỗi khi cập nhật thuộc tính");
    } finally {
      setLoading(false);
    }
  };

  // Function to update descriptions
  const handleUpdateDescriptions = async () => {
    setLoading(true);
    for (const decription of descriptions) {
      if (!decription.key || !decription.value) {
        setMessageDescription(
          "Vui lòng nhập đầy đủ thông tin cho tất cả các mục mô tả."
        );
        setShowMessageDes(true);
        setTimeout(() => {
          setShowMessageDes(false);
        }, 2000);
        setLoading(false);
        return;
      }
    }

    try {
      for (let i = 0; i < descriptions.length; i++) {
        const descriptionData = {
          key: descriptions[i].key,
          value: descriptions[i].value,
        };
        if (descriptions[i]._id) {
          descriptionData.id = descriptions[i]._id;
          const response = await updateDescriptionAPI(
            descriptionData,
            user.access_token
          );
        } else {
          descriptionData.product = product._id;
          const response = await addDescriptionAPI(
            descriptionData,
            user.access_token
          );
        }
      }
      setMessageDescription("Cập nhật thành công mô tả sản phẩm");
      setShowMessageDes(true);
      setTimeout(() => {
        setShowMessageDes(false);
      }, 1500);
    } catch (error) {
      setMessageDescription("Có lỗi khi cập nhật mô tả sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClassify = (index) => {
    if (classifies.length === 1) return;
    const updatedClassifies = [...classifies];
    updatedClassifies.splice(index, 1);
    setClassifies(updatedClassifies);
  };

  const handleDeleteAttribute = async (index, id) => {
    try {
      if (attributes.length === 1) return;
      const updatedAttributes = [...attributes];
      updatedAttributes.splice(index, 1);
      setAttributes(updatedAttributes);
      if (id) {
        const response = await deleteAttributeAPI(id, user.access_token);
      }
    } catch (error) {
      console.error("Error deleting attribute:", error);
    }
  };

  const handleDeleteDescription = async (index, id) => {
    try {
      if (descriptions.length === 1) return;
      const updatedDescriptions = [...descriptions];
      updatedDescriptions.splice(index, 1);
      setDescriptions(updatedDescriptions);
      if (id) {
        const response = await deleteDescriptionAPI(id, user.access_token);
      }
    } catch (error) {
      console.error("Error deleting description:", error);
    }
  };

  // Function to add new description field
  const addDescription = () => {
    setDescriptions([...descriptions, { key: "", value: "" }]);
  };

  // Function to add a new classify field
  const addClassify = () => {
    setClassifies([...classifies, { key: "", value: "", price: 0, stock: 0 }]);
  };

  // Function to add a new attribute field
  const addAttribute = () => {
    setAttributes([...attributes, { key: "", value: "" }]);
  };

  const handleBack = () => {
    setActiveTab("view-product");
  };

  return (
    <div className="p-6">
      {loading && <Loading />}

      {/* Back Button */}
      <div className="mb-4">
        <button onClick={handleBack} className="bg-gray-300 px-4 py-2 rounded">
          Trở Về
        </button>
      </div>

      {/* Product Details Section */}
      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <h2 className="font-bold text-xl mb-4">Thông Tin Chi Tiết Sản Phẩm</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold">Tên Sản Phẩm</label>
            <input
              type="text"
              value={productDetails.productName}
              onChange={(e) =>
                handleInputChange(e, setProductDetails, "productName")
              }
              className="mt-2 p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block font-semibold">Danh Mục</label>
            <select
              className="w-full p-2 border rounded mt-2"
              value={productDetails.category}
              onChange={(e) =>
                handleInputChange(e, setProductDetails, "category")
              }
            >
              {categories.map((cate) => (
                <option key={cate._id} value={cate._id}>
                  {cate.categoriesName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold">Thương Hiệu</label>
            <input
              type="text"
              value={productDetails.brand}
              onChange={(e) => handleInputChange(e, setProductDetails, "brand")}
              className="mt-2 p-2 border rounded w-full"
            />
          </div>
        </div>
        <div className="mb-4 mt-8">
          <label className="block font-semibold">Ảnh Sản Phẩm</label>
          <UploadComponent onUpload={handleDrop} />
          {/* Preview uploaded images */}
          <div className="flex space-x-4 mt-4">
            {oldImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Old Preview ${index}`}
                  className="w-20 h-20 object-cover"
                />
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full"
                  onClick={() => removeOldImage(index)}
                >
                  <RemoveIcon />
                </button>
              </div>
            ))}
            {previewImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Preview ${index}`}
                  className="w-20 h-20 object-cover"
                />
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full"
                  onClick={() => removeNewImage(index)}
                >
                  <RemoveIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleUpdateProduct}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Cập Nhật Sản Phẩm
        </button>
        {showMessagePro && (
          <div
            className={`mt-3 px-4 py-2 rounded ${
              messageProduct.includes("thành công")
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {messageProduct}
          </div>
        )}
      </div>

      {/* Classifies Section */}
      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <h2 className="font-bold text-xl mb-4">Phân Loại</h2>
        {classifies.map((classify, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-8"
            // className="flex justify-between items-center mb-8"
          >
            <div className="col-span-1">
              <label className="block font-semibold">Mô Tả</label>
              <input
                list={`classify-suggestions-${index}`}
                type="text"
                value={classify.key}
                onChange={(e) =>
                  setClassifies((prev) =>
                    prev.map((item, i) =>
                      i === index ? { ...item, key: e.target.value } : item
                    )
                  )
                }
                className="mt-2 p-2 border rounded w-full"
              />
              <datalist id={`classify-suggestions-${index}`}>
                {classifySuggestions.map((suggestion, idx) => (
                  <option key={idx} value={suggestion} />
                ))}
              </datalist>
            </div>
            <div className="col-span-1">
              <label className="block font-semibold">Nội Dung</label>
              <input
                type="text"
                value={classify.value}
                onChange={(e) =>
                  setClassifies((prev) =>
                    prev.map((item, i) =>
                      i === index ? { ...item, value: e.target.value } : item
                    )
                  )
                }
                className="mt-2 p-2 border rounded w-full"
              />
            </div>
            <div className="col-span-1">
              <label className="block font-semibold">Giá</label>
              <input
                type="number"
                value={classify.price}
                min="0"
                onChange={(e) =>
                  setClassifies((prev) =>
                    prev.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            price: Math.max(0, Number(e.target.value)),
                          }
                        : item
                    )
                  )
                }
                className="mt-2 p-2 border rounded w-full"
              />
            </div>
            <div className="col-span-1">
              <label className="block font-semibold">
                Số Lượng tồn kho: {classify.stock}
              </label>
              {/* <span className="text-sm text-gray-500">{classify.stock}</span> */}
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Thêm số lượng vào kho"
                  onChange={(e) =>
                    setClassifies((prev) =>
                      prev.map((item, i) =>
                        i === index
                          ? { ...item, newStock: Number(e.target.value) }
                          : item
                      )
                    )
                  }
                  className="mt-2 p-2 border rounded w-full"
                />
                {/* Clear/Delete Icon */}
                <div className="flex justify-end items-center col-span-1">
                  <ClearIcon
                    className="text-red-500 cursor-pointer"
                    onClick={() => handleDeleteClassify(index)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addClassify}
        >
          Thêm Mục Mới
        </button>
        <button
          onClick={handleUpdateClassifies}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded ml-2"
        >
          Cập Nhật Phân Loại
        </button>
        {showMessageClassify && (
          <div
            className={`mt-3 text-white px-4 py-2 rounded ${
              messageClassify.includes("thành công")
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {messageClassify}
          </div>
        )}
      </div>

      {/* Attributes Section */}
      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <h2 className="font-bold text-xl mb-4">Thuộc Tính</h2>
        {attributes.map((attribute, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block font-semibold">Mô Tả</label>
              <input
                list={`attribute-suggestions-${index}`}
                type="text"
                value={attribute.key}
                onChange={(e) =>
                  setAttributes((prev) =>
                    prev.map((item, i) =>
                      i === index ? { ...item, key: e.target.value } : item
                    )
                  )
                }
                className="mt-2 p-2 border rounded w-full"
              />
              <datalist id={`attribute-suggestions-${index}`}>
                {attributeSuggestions.map((suggestion, idx) => (
                  <option key={idx} value={suggestion} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block font-semibold">Nội Dung</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={attribute.value}
                  onChange={(e) =>
                    setAttributes((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, value: e.target.value } : item
                      )
                    )
                  }
                  className="mt-2 p-2 border rounded w-full"
                />
                <div className="flex justify-end items-center col-span-1">
                  <ClearIcon
                    className="text-red-500 cursor-pointer"
                    onClick={() => handleDeleteAttribute(index, attribute._id)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addAttribute}
        >
          Thêm Mục Mới
        </button>
        <button
          onClick={handleUpdateAttributes}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded ml-2"
        >
          Cập Nhật Thuộc Tính
        </button>
        {showMessageAttri && (
          <div
            className={`mt-3 text-white px-4 py-2 rounded ${
              messageAttribute.includes("thành công")
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {messageAttribute}
          </div>
        )}
      </div>

      {/* Descriptions Section */}
      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <h2 className="font-bold text-xl">Mô Tả Sản Phẩm</h2>
        {descriptions.map((description, index) => (
          <div key={index} className="flex flex-col">
            <div>
              <label className="block font-semibold pt-4">Mô Tả</label>
              <input
                list={`description-suggestions-${index}`}
                type="text"
                value={description.key}
                onChange={(e) =>
                  setDescriptions((prev) =>
                    prev.map((item, i) =>
                      i === index ? { ...item, key: e.target.value } : item
                    )
                  )
                }
                className="p-2 border rounded-lg w-1/3"
              />
              <datalist id={`description-suggestions-${index}`}>
                {descriptionSuggestions.map((suggestion, idx) => (
                  <option key={idx} value={suggestion} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block font-semibold pt-2">Nội Dung</label>
              <div className="flex gap-2 items-center w-full">
                <ReactQuill
                  theme="snow"
                  value={description.value}
                  onChange={(value) =>
                    setDescriptions((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, value } : item
                      )
                    )
                  }
                  className="flex-grow"
                />
                <ClearIcon
                  className="text-red-500 cursor-pointer ml-2"
                  onClick={() =>
                    handleDeleteDescription(index, description._id)
                  }
                />
              </div>
            </div>
          </div>
        ))}
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addDescription}
        >
          Thêm Mục Mới
        </button>
        <button
          onClick={handleUpdateDescriptions}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded ml-2"
        >
          Cập Nhật Mô Tả
        </button>
        {showMessageDes && (
          <div
            className={`mt-3 text-white px-4 py-2 rounded ${
              messageDescription.includes("thành công")
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {messageDescription}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateProduct;
