import api from "../../common/services/api";

export const getAllEmployeeShifts = async () => {
  try {
    const response = await api.get(`/employee-shifts/token`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee shifts:", error);
    throw error;
  }
};

export const getEmployeeShiftById = async (id) => {
  try {
    const response = await api.get(`/employee-shifts/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee shift:", error);
    throw error;
  }
};

export const createEmployeeShift = async (data) => {
  try {
    const response = await api.post("/employee-shifts", data);
    return response.data;
  } catch (error) {
    console.error("Error creating employee shift:", error);
    throw error;
  }
};

export const updateEmployeeShift = async (id, data) => {
  try {
    const response = await api.put(`/employee-shifts/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating employee shift:", error);
    throw error;
  }
};

export const deleteEmployeeShift = async (id) => {
  try {
    const response = await api.delete(`/employee-shifts/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee shift:", error);
    throw error;
  }
};
