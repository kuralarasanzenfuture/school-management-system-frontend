import api from "../../common/services/api";

// TODO: point these at your actual profile endpoints and confirm the
// payload/response shapes your backend expects — these are reasonable
// guesses, not a confirmed contract.

export const getProfileApi = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const updateProfileApi = async (profileData) => {
  const response = await api.put("/users/me", profileData);
  return response.data;
};

// Separate endpoint assumed for avatar upload since it needs
// multipart/form-data rather than JSON.
export const uploadAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await api.post("/auth/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
