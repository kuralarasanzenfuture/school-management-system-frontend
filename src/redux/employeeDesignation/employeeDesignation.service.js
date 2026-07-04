import api from "../../common/services/api";

export const getEmployeeDesignations = async () => {
  try {
    const response = await api.get("/employees-designations/token");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee designations:", error);
    throw error;
  }
};

export const getEmployeeDesignationById = async (id) => {
  try {
    const response = await api.get(`/employees-designations/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee designation:", error);
    throw error;
  }
};

export const createEmployeeDesignation = async (data) => {
  try {
    const response = await api.post("/employees-designations", data);
    return response.data;
  } catch (error) {
    console.error("Error creating employee designation:", error);
    throw error;
  }
};

export const updateEmployeeDesignation = async (id, data) => {
  try {
    const response = await api.put(`/employees-designations/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating employee designation:", error);
    throw error;
  }
};

export const deleteEmployeeDesignation = async (id) => {
  try {
    const response = await api.delete(`/employees-designations/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee designation:", error);
    throw error;
  }
};
