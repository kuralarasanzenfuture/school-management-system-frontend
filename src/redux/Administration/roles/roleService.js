import api from "../../../common/services/api";

const getRoles = async () => {
  const response = await api.get("/roles");
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

const deleteRole = async (id) => {
  const response = await api.delete(`/roles/${id}`);
  return response.data;
};

export { getRoles, createRole, updateRole, deleteRole };
