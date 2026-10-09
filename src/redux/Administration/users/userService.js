import api from "../../../common/services/api";

/**
 * User Service - Full integration with backend user routes:
 * - GET    /users                      (getAllUsers - Admin only, supports search, filter, paginate, sort)
 * - GET    /users/token                (getAllUsersByToken - Scoped to user's school if not admin)
 * - GET    /users/:id                  (getUserById)
 * - POST   /users                      (createUser - Admin only)
 * - POST   /users/register             (createUser - Fallback / public registration)
 * - PUT    /users/update/:id           (updateUser - Admin only)
 * - PATCH  /users/status/:id           (updateUserStatus - Admin only)
 * - DELETE /users/delete/:id           (deleteUser - Admin only)
 * - GET    /users/check-username/:username (checkUsername)
 * - GET    /users/check-email/:email       (checkEmail)
 * - GET    /users/check-phone/:phone       (checkPhone)
 */

const getUsers = async (params = {}) => {
  try {
    const response = await api.get("/users", { params });
    return response.data;
  } catch (err) {
    // If 403 Forbidden (e.g. non-super admin), fallback to token-scoped endpoint
    if (err.response?.status === 403) {
      const fallback = await api.get("/users/token", { params });
      return fallback.data;
    }
    throw err;
  }
};

const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

const createUser = async (userData) => {
  try {
    const response = await api.post("/users", userData);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 403) {
      const fallback = await api.post("/users/register", userData);
      return fallback.data;
    }
    throw err;
  }
};

const updateUser = async ({ id, formData }) => {
  const response = await api.put(`/users/update/${id}`, formData);
  return response.data;
};

const updateUserStatus = async ({ id, status }) => {
  const response = await api.patch(`/users/status/${id}`, { status });
  return response.data;
};

const deleteUser = async (id) => {
  const response = await api.delete(`/users/delete/${id}`);
  return response.data;
};

export const checkUsernameAvailability = async (username) => {
  if (!username || !String(username).trim()) return { available: false, exists: false };
  const encoded = encodeURIComponent(String(username).trim());
  const response = await api.get(`/users/check-username/${encoded}`);
  return response.data;
};

export const checkUserExists = async (username) => {
  const result = await checkUsernameAvailability(username);
  return Boolean(result?.exists);
};

export const checkEmailAvailability = async (email) => {
  if (!email || !String(email).trim()) return { available: false, exists: false };
  const encoded = encodeURIComponent(String(email).trim().toLowerCase());
  const response = await api.get(`/users/check-email/${encoded}`);
  return response.data;
};

export const checkEmailExists = async (email) => {
  const result = await checkEmailAvailability(email);
  return Boolean(result?.exists);
};

export const checkPhoneAvailability = async (phone) => {
  if (!phone || !String(phone).trim()) return { available: false, exists: false };
  const encoded = encodeURIComponent(String(phone).trim());
  const response = await api.get(`/users/check-phone/${encoded}`);
  return response.data;
};

export const checkPhoneExists = async (phone) => {
  const result = await checkPhoneAvailability(phone);
  return Boolean(result?.exists);
};

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
};
