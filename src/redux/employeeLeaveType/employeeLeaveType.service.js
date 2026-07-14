import api from "../../common/services/api";

export const getEmployeeLeaveTypes = async () => {
  try {
    const response = await api.get("/employees-leave-types");
    return response.data;
  } catch (error) {
    console.error("Error fetching employee leave types:", error);
    throw error;
  }
};

export const getEmployeeLeaveTypeById = async (id) => {
  try {
    const response = await api.get(`/employees-leave-types/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee leave type:", error);
    throw error;
  }
};

export const createEmployeeLeaveType = async (data) => {
  try {
    const response = await api.post("/employees-leave-types", data);
    return response.data;
  } catch (error) {
    console.error("Error creating employee leave type:", error);
    throw error;
  }
};

export const updateEmployeeLeaveType = async (id, data) => {
  try {
    const response = await api.put(`/employees-leave-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating employee leave type:", error);
    throw error;
  }
};

export const deleteEmployeeLeaveType = async (id) => {
  try {
    const response = await api.delete(`/employees-leave-types/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee leave type:", error);
    throw error;
  }
};
