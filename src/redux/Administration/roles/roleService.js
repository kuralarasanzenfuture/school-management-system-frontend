import api from "../../../common/services/api";

/**
 * Role Service - Full integration with backend role endpoints:
 * - GET    /roles            (with filtering, search, sorting & pagination)
 * - GET    /roles/:id        (get single role details)
 * - POST   /roles            (create role)
 * - PUT    /roles/:id        (update role)
 * - PATCH  /roles/status/:id (activate/deactivate role with user cascade)
 * - DELETE /roles/:id        (delete role)
 */

const getRoles = async (params = {}) => {
  const response = await api.get("/roles", { params });
  return response.data;
};

const getRoleById = async (id) => {
  const response = await api.get(`/roles/${id}`);
  return response.data;
};

const createRole = async (roleData) => {
  const response = await api.post("/roles", roleData);
  return response.data;
};

const updateRole = async ({ id, formData }) => {
  const response = await api.put(`/roles/${id}`, formData);
  return response.data;
};

const updateRoleStatus = async ({ id, status }) => {
  const response = await api.patch(`/roles/status/${id}`, { status });
  return response.data;
};

const deleteRole = async (id) => {
  const response = await api.delete(`/roles/${id}`);
  return response.data;
};

export {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  updateRoleStatus,
  deleteRole,
};

