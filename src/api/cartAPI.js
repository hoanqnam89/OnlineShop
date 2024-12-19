import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;
const API = axios.create({ baseURL });

export const addToCart = (cartItem) => API.post("/cart/add", cartItem);
export const getCartItemByBuyerId = (buyerId) => API.get(`/cart/${buyerId}`);
export const deleteCartItem = (cartDTO) => API.post(`/cart/remove`, cartDTO);

export const getCheckCartAPI = () => API.get("/cart/checkCart");
