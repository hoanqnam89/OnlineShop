import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;
const API = axios.create({ baseURL });

export const loginAPI = (formData) => API.post("/users/login", formData);
export const registerAPI = (formData) => API.post("/users/register", formData);
export const resetPassAPI = (formData) => API.post("/users/reset", formData);

export const changePassAPI = (formData, token) => {
  return API.post(
    "/users/changePass",
    {
      userName: formData.userName,
      passW: formData.passW,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const updateUserAPI = (formData, token) => {
  return API.post("/users/update", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUserAPI = (id, token) => {
  return API.get(`/users/profile/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const sendOTP = (user) => API.post("/users/sendOTP", user);

export const getTopSeller = () => API.get("/users/findtop10");

export const registerSellerAPI = (formData, token) => {
  return API.post(
    "/users/buyer/register",
    { id: formData.id },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const acceptRegisterSellerAPI = (formData, token) => {
  return API.post(
    "/users/admin/update",
    { id: formData.id },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getAllRegisterSellerAPI = (token) => {
  return API.get("/users/admin/getSeller", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const sendOTPToResetPassAPI = (userName) => {
  return API.post("/users/createOTP", { userName });
};
