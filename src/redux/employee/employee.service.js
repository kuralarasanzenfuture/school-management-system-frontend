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

export const assignUserToEmployee = async (param1, param2) => {
  try {
    let empId;
    let uId;

    if (typeof param1 === "object" && param1 !== null) {
      empId = param1.employee_id ?? param1.employeeId ?? param1.id;
      uId = param1.user_id ?? param1.userId;
    } else {
      empId = param1;
      uId = param2;
    }

    const response = await api.post("/employees/assign-user", {
      employee_id: Number(empId),
      user_id: Number(uId),
    });
    return response.data;
  } catch (error) {
    console.error("Error assigning user to employee:", error);
    throw error;
  }
};

export const unassignUserFromEmployee = async (employeeId) => {
  try {
    const empId =
      typeof employeeId === "object" && employeeId !== null
        ? employeeId.employee_id ?? employeeId.employeeId ?? employeeId.id
        : employeeId;

    const response = await api.post("/employees/unassign-user", {
      employee_id: Number(empId),
    });
    return response.data;
  } catch (error) {
    console.error("Error unassigning user from employee:", error);
    throw error;
  }
};
