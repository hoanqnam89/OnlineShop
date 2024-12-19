import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;
const API = axios.create({ baseURL });

export const addAttributeAPI = (attribute, token) =>
  API.post("/attributes", attribute, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateAttributeAPI = (attribute, token) =>
  API.post("/attributes/update", attribute, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteAttributeAPI = (attributeId, token) =>
  API.get(`/attributes/delete/${attributeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
