// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import {
//   login,
//   getMe,
//   refreshToken,
//   logout,
//   logoutAllDevices,
// } from "./auth.service.js";

// // -------------------- Async Thunks --------------------

// export const loginUser = createAsyncThunk(
//   "auth/loginUser",
//   async (credentials, { rejectWithValue }) => {
//     try {
//       return await login(credentials);
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Login failed");
//     }
//   },
// );

// export const fetchCurrentUser = createAsyncThunk(
//   "auth/fetchCurrentUser",
//   async (_, { rejectWithValue }) => {
//     try {
//       return await getMe();
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to fetch user",
//       );
//     }
//   },
// );

// export const refreshUserToken = createAsyncThunk(
//   "auth/refreshToken",
//   async (_, { rejectWithValue }) => {
//     try {
//       return await refreshToken();
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Token refresh failed",
//       );
//     }
//   },
// );

// export const logoutUser = createAsyncThunk(
//   "auth/logoutUser",
//   async (_, { rejectWithValue }) => {
//     try {
//       await logout();
//       return true;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Logout failed");
//     }
//   },
// );

// export const logoutAll = createAsyncThunk(
//   "auth/logoutAll",
//   async (_, { rejectWithValue }) => {
//     try {
//       await logoutAllDevices();
//       return true;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Logout all failed",
//       );
//     }
//   },
// );

// // -------------------- Initial State --------------------

// const initialState = {
//   user: JSON.parse(localStorage.getItem("user")) || null,
//   accessToken: localStorage.getItem("accessToken") || null,
//   isAuthenticated: !!localStorage.getItem("accessToken"),
//   loading: false,
//   error: null,
// };

// // -------------------- Slice --------------------

// const authSlice = createSlice({
//   name: "auth",
//   initialState,

//   reducers: {
//     clearAuthError(state) {
//       state.error = null;
//     },

//     setCredentials(state, action) {
//       state.user = action.payload.user;
//       state.accessToken = action.payload.accessToken;
//       state.isAuthenticated = true;

//       localStorage.setItem("accessToken", action.payload.accessToken);
//     },

//     clearAuth(state) {
//       state.user = null;
//       state.accessToken = null;
//       state.isAuthenticated = false;
//       state.error = null;

//       localStorage.removeItem("accessToken");
//     },
//   },

//   extraReducers: (builder) => {
//     builder

//       // Login
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loading = false;

//         state.user = action.payload.user;
//         state.accessToken = action.payload.accessToken;
//         state.isAuthenticated = true;

//         localStorage.setItem("accessToken", action.payload.accessToken);

//         localStorage.setItem("user", JSON.stringify(action.payload.user));
//         console.log(action.payload);
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Current User
//       .addCase(fetchCurrentUser.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchCurrentUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload;
//         // console.log("fetchCurrentUser", action.payload);
//         localStorage.setItem("user", JSON.stringify(action.payload));
//       })
//       .addCase(fetchCurrentUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Refresh Token
//       .addCase(refreshUserToken.fulfilled, (state, action) => {
//         state.accessToken = action.payload.accessToken;

//         localStorage.setItem("accessToken", action.payload.accessToken);
//       })

//       // Logout
//       .addCase(logoutUser.fulfilled, (state) => {
//         state.user = null;
//         state.accessToken = null;
//         state.isAuthenticated = false;

//         localStorage.removeItem("accessToken");
//         localStorage.removeItem("user");
//       })

//       // Logout All
//       .addCase(logoutAll.fulfilled, (state) => {
//         state.user = null;
//         state.accessToken = null;
//         state.isAuthenticated = false;

//         localStorage.removeItem("accessToken");
//       });
//   },
// });

// export const { clearAuth, clearAuthError, setCredentials } = authSlice.actions;

// export default authSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  login,
  getMe,
  refreshToken,
  logout,
  logoutAllDevices,
} from "./auth.service.js";

// -------------------- Helpers --------------------

// Handles both `{ success, data: {...} }` wrapper shape and an
// already-flat user object, so it's safe no matter which endpoint
// happens to wrap its response and which doesn't.
function unwrapUser(payload) {
  return payload?.data ?? payload;
}

// -------------------- Async Thunks --------------------

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      return await login(credentials);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await getMe();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user",
      );
    }
  },
);

export const refreshUserToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      return await refreshToken();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await logout();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

export const logoutAll = createAsyncThunk(
  "auth/logoutAll",
  async (_, { rejectWithValue }) => {
    try {
      await logoutAllDevices();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Logout all failed",
      );
    }
  },
);

// -------------------- Initial State --------------------

const rawStoredUser = JSON.parse(localStorage.getItem("user")) || null;

const initialState = {
  // Guard against old cached data that may have been saved in the
  // wrapped `{ success, data }` shape before this fix.
  user: unwrapUser(rawStoredUser),
  accessToken: localStorage.getItem("accessToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  loading: false,
  error: null,
};

// -------------------- Slice --------------------

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearAuthError(state) {
      state.error = null;
    },

    setCredentials(state, action) {
      const userData = unwrapUser(action.payload.user);
      state.user = userData;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;

      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
    },

    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
  },

  extraReducers: (builder) => {
    builder

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        const userData = unwrapUser(action.payload.user);
        state.user = userData;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;

        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;

        const userData = unwrapUser(action.payload);
        console.log(userData);
        state.user = userData;

        // localStorage.setItem("user", JSON.stringify(userData));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Refresh Token
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;

        localStorage.setItem("accessToken", action.payload.accessToken);
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      })

      // Logout All
      .addCase(logoutAll.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      });
  },
});

export const { clearAuth, clearAuthError, setCredentials } = authSlice.actions;

export default authSlice.reducer;