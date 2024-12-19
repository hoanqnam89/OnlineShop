import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import cateReducer from "./features/cateSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    cate: cateReducer,
  },
});

export default store;
