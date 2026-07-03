import api from "../../../common/services/api";

const getDepartments = async () => {
  try {
    const response = await api.get("/departments/token");
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const getDepartmentById = async (id) => {
  try {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching department:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const getDepartmentsBySchoolId = async (schoolId) => {
  try {
    const response = await api.get(`/departments/school/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const createDepartment = async (departmentData) => {
  try {
    const response = await api.post("/departments", departmentData);
    return response.data;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const updateDepartment = async (id, formData) => {
  try {
    const response = await api.put(`/departments/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error updating department:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const deleteDepartment = async (id) => {
  try {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export {
  getDepartments,
  getDepartmentById,
  getDepartmentsBySchoolId,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
