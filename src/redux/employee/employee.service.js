import api from "../../common/services/api";

export const getEmployees = async () => {
  try {
    const response = await api.get("/employees");
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const getEmployeeById = async (id) => {
  try {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee:", error);
    throw error;
  }
};

export const createEmployee = async (data) => {
  try {
    const response = await api.post("/employees", data);
    return response.data;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

export const updateEmployee = async (id, data) => {
  try {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
};


