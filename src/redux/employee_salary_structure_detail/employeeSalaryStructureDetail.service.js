import api from "../../common/services/api";

export const getEmployeeSalaryStructureDetail = async (id) => {
  try {
    const response = await api.get(`/employee-salary-structures-details/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee salary structure detail:", error);
    throw error;
  }
};

export const getAllEmployeeSalaryStructureDetails = async () => {
  try {
    const response = await api.get(`/employee-salary-structures-details`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee salary structure details:", error);
    throw error;
  }
};

export const createEmployeeSalaryStructureDetail = async (data) => {
  try {
    const response = await api.post(
      "/employee-salary-structures-details",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating employee salary structure detail:", error);
    throw error;
  }
};

export const updateEmployeeSalaryStructureDetail = async (id, data) => {
  try {
    const response = await api.put(
      `/employee-salary-structures-details/${id}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating employee salary structure detail:", error);
    throw error;
  }
};

export const deleteEmployeeSalaryStructureDetail = async (id) => {
  try {
    const response = await api.delete(
      `/employee-salary-structures-details/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting employee salary structure detail:", error);
    throw error;
  }
};

export const getEmployeeSalaryStructureDetailByEmployeeId = async (
  employeeId,
) => {
  try {
    const response = await api.get(
      `/employee-salary-structures-details/full-salary-by-employee/${employeeId}`,
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching employee salary structure detail by employee id:",
      error,
    );
    throw error;
  }
};
