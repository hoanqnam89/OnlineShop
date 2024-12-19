import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCate } from "../api/cateAPI";

export const fetchCategories = createAsyncThunk(
  "cate/fetchCategories",
  async () => {
    const response = await getAllCate();
    return response.data;
  }
);
