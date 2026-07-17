import api from "../../common/services/api";

export const getAllEmployeeSalaryStructures = async () => {
  try {
    const response = await api.get(`/employee-salary-structures`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee salary structures:", error);
    throw error;
  }
};

export const getEmployeeSalaryStructureById = async (id) => {
  try {
    const response = await api.get(`/employee-salary-structures/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee salary structure:", error);
    throw error;
  }
};

export const createEmployeeSalaryStructure = async (data) => {
  try {
    const response = await api.post("/employee-salary-structures", data);
    return response.data;
  } catch (error) {
    console.error("Error creating employee salary structure:", error);
    throw error;
  }
};

export const updateEmployeeSalaryStructure = async (id, data) => {
  try {
    const response = await api.put(`/employee-salary-structures/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating employee salary structure:", error);
    throw error;
  }
};

export const deleteEmployeeSalaryStructure = async (id) => {
  try {
    const response = await api.delete(`/employee-salary-structures/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee salary structure:", error);
    throw error;
  }
};
