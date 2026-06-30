import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi } from "../api/authApi";

export const login = createAsyncThunk(
  "auth/login",
  async (loginData, thunkAPI) => {
    try {
      const response = await loginApi(loginData);

      console.log("API Response:", response.data);

      return response.data;
    } catch (error) {
      console.log("API Error:", error.response);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login Failed"
      );
    }
  }
);
