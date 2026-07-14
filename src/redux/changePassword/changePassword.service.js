import api from "../../common/services/api";

export const changePasswordByUser = async (passwords) => {
  try {
    const response = await api.put("/users/change-password", passwords);
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};
