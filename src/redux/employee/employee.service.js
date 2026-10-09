import api from "../../common/services/api";

export const getEmployees = async (params = {}) => {
  try {
    // Default all: "true" so the backend does not cap the list at 20 employees
    const queryParams = { all: "true", ...params };
    const response = await api.get("/employees", { params: queryParams });
    return response.data;
  } catch (error) {
    // If 403 Forbidden (scoped/non-super admin) or 404, fallback to /employees/token
    if (error.response?.status === 403 || error.response?.status === 404) {
      const queryParams = { all: "true", ...params };
      const fallback = await api.get("/employees/token", { params: queryParams });
      return fallback.data;
    }
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

export const assignUserToEmployee = async ({ employeeId, userId }) => {
  try {
    const response = await api.post("/employees/assign-user", {
      employee_id: employeeId,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error assigning user to employee:", error);
    throw error;
  }
};

export const unassignUserFromEmployee = async (employeeId) => {
  try {
    const response = await api.post("/employees/unassign-user", {
      employee_id: employeeId,
    });
    return response.data;
  } catch (error) {
    console.error("Error unassigning user from employee:", error);
    throw error;
  }
};
