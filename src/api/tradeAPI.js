import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;
const API = axios.create({ baseURL });

export const addTradeAPI = (trade, token) =>
  API.post("/trade/add", trade, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const tradePaymentAPI = (trade, token) =>
  API.post("/trade/payment", trade, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const acceptTradeAPI = (trade, token) =>
  API.post("/trade/accept", trade, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const cancelTradeAPI = (trade, token) =>
  API.post("/trade/cancel", trade, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const refundTradeAPI = (trade, token) =>
  API.post("/trade/refund", trade, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getTradeAPI = (id, token) =>
  API.get(`/trade/buyer/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getTradeBySellerAPI = (id, token) =>
  API.get(`/trade/seller/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getTradeInYearAPI = (userId) => {
  return API.post("/trade/getTradeInYear", { userId });
};

export const getWalletByUserIdAPI = (user) => {
  return API.post("/wallet/getById", { user });
};

export const gettradeDayInMonthAPI = (userId, month, year, token) => {
  return API.post(
    "/trade/gettradeDayInMonth",
    { userId, month, year },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getUpdateTradeStatusAPI = (trade, token) =>
  API.post("/trade/updateStatus", trade, {
    headers: { Authorization: `Bearer ${token}` },
  });
