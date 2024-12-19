import { useEffect, useState } from "react";
import UploadComponent from "../../../../components/Dropzone/UploadComponent";
import ClearIcon from "@mui/icons-material/Clear";

import {
  addClassifyAPI,
  addProductAPI,
  uploadFile,
} from "../../../../api/productAPI";
import { getAllCate } from "../../../../api/cateAPI";
import { addAttributeAPI } from "../../../../api/attriAPI";
import { addDescriptionAPI } from "../../../../api/descriptAPI";
import RemoveIcon from "@mui/icons-material/Remove";
import Loading from "../../../../components/Loading/Loading";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Notification from "../../../../components/Notification/Notification";

const AddProduct = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState([
    { key: "", value: "" },
  ]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [classifies, setClassifies] = useState([
    { key: "", value: "", price: 0, stock: 0 },
  ]);
  const [attributes, setAttributes] = useState([{ key: "", value: "" }]);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [showNotification, setShowNotification] = useState(false);

  const validateFields = () => {
    const errors = {};
    if (!productName.trim()) errors.productName = "Tên Sản Phẩm là bắt buộc";
    if (!category) errors.category = "Danh Mục là bắt buộc";
    if (!brand.trim()) errors.brand = "Thương Hiệu là bắt buộc";
    if (!images.length)
      errors.images = "Vui lòng tải lên ít nhất một ảnh sản phẩm";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
    "Hạn sử dụng",
  ];
  const descriptionSuggestions = [
    "Mô tả sản phẩm",
    "Thông tin sản phẩm",
    "Cách dùng",
    "Hướng dẫn sử dụng",
  ];

  const handleDescriptionChange = (value, index) => {
    setProductDescription((prev) =>
      prev.map((desc, i) => (i === index ? { ...desc, value } : desc))
    );
  };

  // Function to add new description field
  const addDescription = () => {
    setProductDescription([...productDescription, { key: "", value: "" }]);
  };

  // Function to delete a description field
  const deleteDescription = (index) => {
    if (productDescription.length === 1) return;
    setProductDescription(productDescription.filter((_, i) => i !== index));
  };

  // Function to add a new classify field
  const addClassify = () => {
    setClassifies([...classifies, { key: "", value: "", price: 0, stock: 0 }]);
  };

  // Function to add a new attribute field
  const addAttribute = () => {
    setAttributes([...attributes, { key: "", value: "" }]);
  };

  // Function to delete a classify field
  const deleteClassify = (index) => {
    if (classifies.length === 1) return;
    setClassifies(classifies.filter((_, i) => i !== index));
  };

  const deleteAttribute = (index) => {
    if (attributes.length === 1) return;
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleDrop = (files) => {
    const previewUrls = [];
    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.push(previewUrl);
    }
    setPreviewImages([...previewImages, ...previewUrls]);
    setImages([...images, ...files]);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getAllCate();
      setCategories(response.data);
      setCategory(response.data[0]._id);
    };
    fetchCategories();
  }, []);

  // Xóa ảnh mới (chỉ là preview chưa upload)
  const removeImagePreview = (index) => {
    const updatedPreviewImages = previewImages.filter((_, i) => i !== index);
    const updatedNewImages = images.filter((_, i) => i !== index);
    setPreviewImages(updatedPreviewImages);
    setImages(updatedNewImages);
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      for (const image of images) {
        formData.append("images", image);
      }
      const response = await uploadFile(formData);
      const imagesURL = response.data;

      const addedImages = [...imagesURL];

      // Prepare product data
      const product = {
        productName,
        brand,
        cate: category,
        seller: user._id,
        images: addedImages,
      };
      // Call API to add product
      console.log(product);
      const resProduct = await addProductAPI(product);
      console.log(resProduct.data);

      // Prepare and call API to add classifies
      for (const classify of classifies) {
        const classifyData = {
          key: classify.key,
          value: classify.value,
          price: classify.price,
          stock: classify.stock,
          product: resProduct.data._id,
        };
        const resClassify = await addClassifyAPI(
          classifyData,
          user.access_token
        );
        console.log(resClassify.data);
      }

      // Prepare and call API to add attributes
      for (const attribute of attributes) {
        const attributeData = {
          key: attribute.key,
          value: attribute.value,
          productId: resProduct.data._id,
        };
        const resAttribute = await addAttributeAPI(
          attributeData,
          user.access_token
        );
        console.log(resAttribute.data);
      }

      // Prepare and call API to add descriptions
      for (const description of productDescription) {
        const descriptionData = {
          key: description.key,
          value: description.value,
          product: resProduct.data._id,
        };
        const resDescription = await addDescriptionAPI(
          descriptionData,
          user.access_token
        );
        console.log(resDescription.data);
      }
      // Reset form
      setProductName("");
      setBrand("");
      setCategory(categories[0]._id);
      setClassifies([{ key: "", value: "", price: 0, stock: 0 }]);
      setAttributes([{ key: "", value: "" }]);
      setProductDescription([{ key: "", value: "" }]);
      setImages([]);
      setPreviewImages([]);
    } catch (error) {
      console.error("An error occurred while submitting:", error);
    } finally {
      setLoading(false);
      setShowNotification(true);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {loading && <Loading />}
      {showNotification && (
        <Notification
          message="Thêm sản phẩm thành công"
          onClose={() => setShowNotification(false)}
        />
      )}
      <h1 className="text-xl font-bold mb-4">Thêm Mới Sản Phẩm</h1>
      {/* Product Name */}
      <div className="mb-4">
        <label className="block text-gray-700">Tên Sản Phẩm</label>
        <input
          type="text"
          className={`w-full p-2 border rounded-lg mt-2 ${
            validationErrors.productName ? "border-red-500" : ""
          }`}
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        {validationErrors.productName && (
          <p className="text-red-500 text-sm">{validationErrors.productName}</p>
        )}
      </div>

      {/* Category and Brand */}
      <div className="flex gap-10">
        <div className="mb-4">
          <label className="block text-gray-700">Danh Mục</label>
          <select
            className={`w-full p-2 border rounded-lg mt-2 ${
              validationErrors.category ? "border-red-500" : ""
            }`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cate) => (
              <option key={cate._id} value={cate._id}>
                {cate.categoriesName}
              </option>
            ))}
          </select>
          {validationErrors.category && (
            <p className="text-red-500 text-sm">{validationErrors.category}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Thương Hiệu</label>
          <input
            type="text"
            className={`w-full p-2 border rounded-lg mt-2 ${
              validationErrors.brand ? "border-red-500" : ""
            }`}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
          {validationErrors.brand && (
            <p className="text-red-500 text-sm">{validationErrors.brand}</p>
          )}
        </div>
      </div>

      {/* Classify */}
      <div className="mb-4">
        <label className="block text-gray-700">Phân loại</label>
        {classifies.map((classify, index) => (
          <div key={index} className="flex space-x-4 items-center mb-4">
            <div className="w-1/4">
              {/* <label className="block text-gray-700 text-sm mb-1">Key</label> */}
              <input
                list={`classify-suggestions-${index}`}
                type="text"
                placeholder="Mô tả"
                className="w-full p-2 border rounded-lg"
                value={classify.key}
                onChange={(e) =>
                  setClassifies((prev) =>
                    prev.map((item, i) =>
                      i === index ? { ...item, key: e.target.value } : item
                    )
                  )
                }
              />
              <datalist id={`classify-suggestions-${index}`}>
                {classifySuggestions.map((suggestion, idx) => (
                  <option key={idx} value={suggestion} />
                ))}
              </datalist>
            </div>
            <div className="w-1/4">
              {/* <label className="block text-gray-700 text-sm mb-1">Value</label> */}
              <input
                type="text"
                placeholder="Nội dung"
                className="w-full p-2 border rounded-lg"
                value={classify.value}
                onChange={(e) =>
                  setClassifies((prev) =>
                    prev.map((item, i) =>
                      i === index ? { ...item, value: e.target.value } : item
                    )
                  )
                }
              />
            </div>
            <label className="block text-gray-700 text-sm mb-1">Giá</label>
            <div className="w-1/4">
              <input
                type="number"
                placeholder="Price"
                className="w-full p-2 border rounded-lg"
                value={classify.price}
                min="0"
                onChange={(e) =>
                  setClassifies((prev) =>
                    prev.map((item, i) =>
                      i === index
                        ? { ...item, price: Math.max(0, e.target.value) }
                        : item
                    )
                  )
                }
              />
            </div>
            <label className="block text-gray-700 text-sm mb-1">Số Lượng</label>
            <div className="w-1/4">
              <input
                type="number"
                placeholder="Stock"
                className="w-full p-2 border rounded-lg"
                value={classify.stock}
                min="0"
                onChange={(e) =>
                  setClassifies((prev) =>
                    prev.map((item, i) =>
                      i === index
                        ? { ...item, stock: Math.max(e.target.value) }
                        : item
                    )
                  )
                }
              />
            </div>
            <ClearIcon
              className="text-red-500 cursor-pointer"
              onClick={() => deleteClassify(index)}
            />
          </div>
        ))}
        <button
          className="mt-2 p-2 bg-blue-500 text-white rounded-lg"
          onClick={addClassify}
        >
          Thêm Phân Loại
        </button>
      </div>

      {/* Attributes */}
      <div className="mb-4">
        <label className="block text-gray-700">Thuộc Tính</label>
        {attributes.map((attribute, index) => (
          <div key={index} className="flex space-x-4 mb-2">
            <input
              list={`attribute-suggestions-${index}`}
              type="text"
              placeholder="Mô tả"
              className="w-1/2 p-2 border rounded-lg"
              value={attribute.key}
              onChange={(e) =>
                setAttributes((prev) =>
                  prev.map((item, i) =>
                    i === index ? { ...item, key: e.target.value } : item
                  )
                )
              }
            />
            <datalist id={`attribute-suggestions-${index}`}>
              {attributeSuggestions.map((suggestion, idx) => (
                <option key={idx} value={suggestion} />
              ))}
            </datalist>
            <input
              type="text"
              placeholder="Nội dung"
              className="w-1/2 p-2 border rounded-lg"
              value={attribute.value}
              onChange={(e) =>
                setAttributes((prev) =>
                  prev.map((item, i) =>
                    i === index ? { ...item, value: e.target.value } : item
                  )
                )
              }
            />
            <ClearIcon
              className="text-red-500 cursor-pointer"
              onClick={() => deleteAttribute(index)}
            />
          </div>
        ))}
        <button
          className="mt-2 p-2 bg-blue-500 text-white rounded-lg"
          onClick={addAttribute}
        >
          Thêm Thuộc Tính
        </button>
      </div>

      {/* Description Product */}
      <div className="mb-4">
        <label className="block text-gray-700">Mô Tả Sản Phẩm</label>
        {productDescription.map((desc, index) => (
          <div key={index} className="flex flex-col gap-2 mb-2">
            <input
              list={`description-suggestions-${index}`}
              type="text"
              placeholder="Mô tả"
              className="w-1/3 p-2 border rounded-lg"
              value={desc.key}
              onChange={(e) =>
                setProductDescription((prev) =>
                  prev.map((item, i) =>
                    i === index ? { ...item, key: e.target.value } : item
                  )
                )
              }
            />
            <datalist id={`description-suggestions-${index}`}>
              {descriptionSuggestions.map((suggestion, idx) => (
                <option key={idx} value={suggestion} />
              ))}
            </datalist>
            <div className="flex items-center gap-2 w-full">
              <ReactQuill
                theme="snow"
                value={desc.value}
                onChange={(value) => handleDescriptionChange(value, index)}
                className="flex-grow"
              />
              <ClearIcon
                className="text-red-500 cursor-pointer"
                onClick={() => deleteDescription(index)}
              />
            </div>
          </div>
        ))}
        <button
          className="mt-2 p-2 bg-blue-500 text-white rounded-lg"
          onClick={addDescription}
        >
          Thêm Mô Tả
        </button>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-gray-700">Ảnh Sản Phẩm</label>
        <UploadComponent onUpload={handleDrop} />
        {validationErrors.images && (
          <p className="text-red-500 text-sm">{validationErrors.images}</p>
        )}
        {/* Preview uploaded images */}
        <div className="flex space-x-4 mt-4">
          {previewImages.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Preview ${index}`}
                className="w-20 h-20 object-cover"
              />
              <button
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full"
                onClick={() => removeImagePreview(index)}
              >
                <RemoveIcon />
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!images.length}
        className="mt-4 p-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
};

export default AddProduct;
