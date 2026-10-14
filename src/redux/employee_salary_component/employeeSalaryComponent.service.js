import api from "../../common/services/api";

export const getAllEmployeeSalaryComponents = async (params = {}) => {
  try {
    const response = await api.get(`/employee-salary-components/token`, { params });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403 || error.response?.status === 404) {
      const fallback = await api.get(`/employee-salary-components`, { params });
      return fallback.data;
    }
    console.error("Error fetching employee salary components:", error);
    throw error;
  }
};

export const getEmployeeSalaryComponentById = async (id) => {
  try {
    const response = await api.get(`/employee-salary-components/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee salary component:", error);
    throw error;
  }
};

export const createEmployeeSalaryComponent = async (data) => {
  try {
    const response = await api.post("/employee-salary-components", data);
    return response.data;
  } catch (error) {
    console.error("Error creating employee salary component:", error);
    throw error;
  }
};

export const updateEmployeeSalaryComponent = async (id, data) => {
  try {
    const response = await api.put(`/employee-salary-components/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating employee salary component:", error);
    throw error;
  }
};

export const updateEmployeeSalaryComponentStatus = async (id, status) => {
  try {
    const response = await api.patch(
      `/employee-salary-components/status/${id}`,
      { status },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating employee salary component status:", error);
    throw error;
  }
};

export const deleteEmployeeSalaryComponent = async (id) => {
  try {
    const response = await api.delete(`/employee-salary-components/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee salary component:", error);
    throw error;
  }
};

export const checkExistingEmployeeSalaryComponent = async ({
  school_id,
  name,
  code,
  exclude_id,
}) => {
  try {
    const response = await api.get(
      "/employee-salary-components/check-existing",
      {
        params: {
          school_id,
          name,
          code,
          exclude_id,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error checking employee salary component:", error);
    throw error;
  }
};
