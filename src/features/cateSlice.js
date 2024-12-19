import { createSlice } from "@reduxjs/toolkit";
import { fetchCategories } from "../actions/cateAction";

export const cateSlice = createSlice({
  name: "cate",
  initialState: {
    categories: [],
    status: "idle",
    error: null,
  },

  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default cateSlice.reducer;

export const selectAllCategories = (state) => state.cate.categories;
