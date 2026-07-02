import api from "../../../common/services/api";

const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

const createUser = async (userData) => {
  const response = await api.post("/users/register", userData);
  return response.data;
};

const updateUser = async ({ id, formData }) => {
  const response = await api.put(`/users/update/${id}`, formData);
  return response.data;
};

const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const checkUserExists = async (username) => {
  try {
    const response = await api.get(`/users/check-username/${username}`);
    return response.data.exists;
  } catch (error) {
    console.error("Error checking user existence:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const checkEmailExists = async (email) => {
  try {
    const response = await api.get(`/users/check-email/${email}`);
    return response.data.exists;
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const checkPhoneExists = async (phone) => {
  try {
    const response = await api.get(`/users/check-phone/${phone}`);
    return response.data.exists;
  } catch (error) {
    console.error("Error checking phone existence:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export { getUsers, getUserById, createUser, updateUser, deleteUser };
