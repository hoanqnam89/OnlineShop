import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;
const API = axios.create({ baseURL });

export const getAllCate = () => API.get("/categories/allCate");
