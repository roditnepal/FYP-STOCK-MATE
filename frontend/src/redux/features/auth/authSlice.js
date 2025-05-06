import { createSlice } from "@reduxjs/toolkit";

let name = "";
try {
  const storedName = localStorage.getItem("name");
  name = storedName ? JSON.parse(storedName) : "";
} catch (error) {
  console.error("Error parsing name from localStorage:", error);
  localStorage.removeItem("name");
}

const initialState = {
  isLoggedIn: false,
  name: name || "",
  user: {
    name: "",
    email: "",
    phone: "",
    bio: "",
    photo: "",
    role: "",
    categories: [],
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    SET_LOGIN(state, action) {
      state.isLoggedIn = action.payload;
    },
    SET_NAME(state, action) {
      localStorage.setItem("name", JSON.stringify(action.payload));
      state.name = action.payload;
    },
    SET_USER(state, action) {
      const profile = action.payload;
      state.user = profile;
    },
  },
});

// Selectors
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectName = (state) => state.auth.name;
export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => {
  if (!state.auth.user) return "";
  return state.auth.user.role || "";
};
export const selectCategories = (state) => {
  if (!state.auth.user) return [];
  return state.auth.user.categories || [];
};
export const selectIsAdmin = (state) => {
  if (!state.auth.user) return false;
  return state.auth.user.role === "admin";
};

// Action creators
export const { SET_LOGIN, SET_NAME, SET_USER } = authSlice.actions;

export default authSlice.reducer;
