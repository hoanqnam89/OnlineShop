import React from "react";
import { useState, useEffect, useRef } from "react";

import { Button, Group, Text, rem } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDispatch, useSelector } from "react-redux";
import { updateUserAPI } from "../../api/userAPI";
import { updateUser } from "../../features/authSlice";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Notification from "../Notification/Notification";
import UploadComponent from "../Dropzone/UploadComponent";
import { uploadFile } from "../../api/productAPI";
import Loading from "../Loading/Loading";

const ProfileSection = ({ props }) => {
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("user"));

  const openRef = useRef(null);
  const [name, setName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.number || "");
  const [gender, setGender] = useState(user?.sex || "");
  const [avatar, setAvatar] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [addressDetail, setAddressDetail] = useState("");
  const [isEditAddress, setIsEditAddress] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 0) {
          setProvinces(data.data);
        }
      })
      .catch((error) => {
        console.error("Error provinces:", error);
      });
  }, []);

  const handleProvinceChange = (e) => {
    const provinceID = e.target.value;
    setSelectedProvince(provinceID);
    const selected = provinces.find((province) => province.id === provinceID);
    setProvinceName(selected.full_name);
    fetch(`https://esgoo.net/api-tinhthanh/2/${provinceID}.htm`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 0) {
          setDistricts(data.data);
          setWards([]);
        }
      })
      .catch((error) => {
        console.error("Error districts:", error);
      });
  };

  const handleDistrictChange = (e) => {
    const districtID = e.target.value;
    setSelectedDistrict(districtID);
    const selected = districts.find((district) => district.id === districtID);
    setDistrictName(selected.full_name);
    fetch(`https://esgoo.net/api-tinhthanh/3/${districtID}.htm`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 0) {
          setWards(data.data);
        }
      })
      .catch((error) => {
        console.error("Error wards:", error);
      });
  };

  const handleWardChange = (e) => {
    const wardID = e.target.value;
    setSelectedWard(wardID);
    const selected = wards.find((ward) => ward.id === wardID);
    setWardName(selected.full_name);
  };

  const handleChange = (event) => {
    setGender(event.target.value);
  };

  const handleChangeName = (event) => {
    setName(event.target.value);
  };

  const handleChangePhoneNumber = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleChangeAddressDetail = (event) => {
    setAddressDetail(event.target.value);
  };

  const toggleEditAddress = () => {
    setIsEditAddress(!isEditAddress);
  };

  const handleUpload = (files) => {
    if (files.length > 0) {
      const file = files[0];
      setAvatar(file);
      setPreviewImages([URL.createObjectURL(file)]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const regexNumber = /^\d{10}$/;

    if (phoneNumber && !regexNumber.test(phoneNumber)) {
      alert("Vui lòng nhập số điện thoại hợp lệ");
      setLoading(false);
      return;
    }

    if (isEditAddress && addressDetail === "") {
      alert("Vui lòng nhập địa chỉ chi tiết");
      setLoading(false);
      return;
    }

    const address =
      selectedProvince && selectedDistrict && selectedWard
        ? `${addressDetail} - ${wardName} - ${districtName} - ${provinceName}`
        : user.address;
    try {
      let updateAvatar = user.avata;
      if (avatar) {
        const formData = new FormData();
        formData.append("file", avatar);
        const resUpload = await uploadFile(formData);
        if (resUpload.status === 201) {
          updateAvatar = resUpload.data[0];
          console.log("Upload success", resUpload.data[0]);
        }
      }

      console.log("url avatar", avatarUrl);

      const resupdateUser = await updateUserAPI(
        {
          id: user._id,
          userName: user.userName,
          role: user.role,
          name: name,
          avata: updateAvatar,
          address: address,
          sex: gender || user.sex,
          number: phoneNumber,
        },
        user.access_token
      );
      if (resupdateUser.status === 201) {
        dispatch(updateUser(resupdateUser.data));
        console.log("Update success", resupdateUser.data);
        setIsEditAddress(false);
        setShowNotification(true);
      }
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  return (
    <>
      {loading && <Loading />}
      <div className="profile-header">
        <h2>Hồ Sơ Cá Nhân</h2>
      </div>
      <div className="profile-body">
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-items">
            <label className="label-item" htmlFor="name">
              Tên:
            </label>
            <input
              id="name"
              onChange={handleChangeName}
              value={name}
              type="text"
            />
          </div>
          <div className="form-items">
            <label className="label-item" htmlFor="email">
              Email:
            </label>
            <a>{user.userName}</a>
          </div>
          <div className="form-items">
            <label className="label-item" htmlFor="email">
              Điện thoại:
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={handleChangePhoneNumber}
            />
          </div>

          <div className="form-items">
            <label className="label-item" htmlFor="email">
              Giới Tính:
            </label>
            <div className="radio-section">
              <div className="radio-group">
                <input
                  type="radio"
                  id="male"
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={handleChange}
                />
                <label htmlFor="male">Nam</label>
              </div>
              <div className="radio-group">
                <input
                  type="radio"
                  id="female"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={handleChange}
                />
                <label htmlFor="female">Nữ</label>
              </div>
              <div className="radio-group">
                <input
                  type="radio"
                  id="other"
                  name="gender"
                  value="other"
                  checked={gender === "other"}
                  onChange={handleChange}
                />
                <label htmlFor="other">Khác</label>
              </div>
            </div>
          </div>
          <div className="form-items">
            <label className="label-item">Địa chỉ:</label>
            <span style={{ fontSize: "1rem", fontStyle: "italic" }}>
              {user.address || "Chưa cập nhật"}
            </span>
            <button
              className="edit-btn"
              type="button"
              onClick={toggleEditAddress}
            >
              Thay đổi
              <ArrowDropDownIcon />
            </button>
          </div>
          {/* mobile */}
          <button
            className="edit-btn-mobile"
            type="button"
            onClick={toggleEditAddress}
          >
            Thay đổi
            <ArrowDropDownIcon />
          </button>
          <div className={`address-form ${isEditAddress ? "show" : ""}`}>
            {isEditAddress && (
              <div className="address-form-section">
                <div className="select-fields">
                  <select
                    className="css_select"
                    id="tinh"
                    name="tinh"
                    title="Chọn Tỉnh Thành"
                    onChange={handleProvinceChange}
                  >
                    <option value="0">Tỉnh Thành</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.full_name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="css_select"
                    id="quan"
                    name="quan"
                    title="Chọn Quận Huyện"
                    onChange={handleDistrictChange}
                  >
                    <option value="0">Quận Huyện</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.full_name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="css_select"
                    id="phuong"
                    name="phuong"
                    title="Chọn Phường Xã"
                    onChange={handleWardChange}
                  >
                    <option value="0">Phường Xã</option>
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="edit-detail-address">
                  <input
                    className="css_input"
                    id="address"
                    type="text"
                    value={addressDetail}
                    onChange={handleChangeAddressDetail}
                    placeholder="Nhập địa chỉ chi tiết"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-gray-700">Ảnh đại diện</label>
            <UploadComponent openRef={openRef} onUpload={handleUpload} />
            {/* Preview uploaded images */}
            {previewImages.length > 0 && (
              <div className="flex space-x-4 mt-4">
                <img
                  src={previewImages[0]}
                  alt="Preview"
                  className="w-20 h-20 object-cover"
                />
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <Button type="submit" className="update-btn" variant="filled">
              Cập Nhật
            </Button>
          </div>
        </form>
      </div>
      {showNotification && (
        <Notification
          message="Cập nhật thông tin thành công"
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
};

export default ProfileSection;
