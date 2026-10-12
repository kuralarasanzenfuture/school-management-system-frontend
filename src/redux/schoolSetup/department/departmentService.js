import api from "../../../common/services/api";

const getDepartments = async (params = {}) => {
  try {
    const response = await api.get("/departments/token", { params });
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

const updateDepartmentStatus = async (id, status) => {
  try {
    const response = await api.patch(`/departments/status/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating department status:", error);
    throw error;
  }
};

export const checkDepartmentExist = async (schoolId, departmentName, excludeId = null) => {
  try {
    const params = {
      school_id: schoolId,
      name: departmentName,
    };
    if (excludeId) {
      params.id = excludeId;
    }
    const response = await api.get("/departments/check-department", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error checking department:", error);
    throw error;
  }
};

export {
  getDepartments,
  getDepartmentById,
  getDepartmentsBySchoolId,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
  deleteDepartment,
};
