import api from "../../common/services/api";

export const getAllEmployeeAttendances = async () => {
  try {
    const response = await api.get("/employee_attendances/token");
    return response.data;
  } catch (error) {
    console.error("Error fetching employee attendances:", error);
    throw error;
  }
};

export const getEmployeeAttendanceById = async (id) => {
  try {
    const response = await api.get(`/employee_attendances/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee attendance:", error);
    throw error;
  }
};

export const createAttendance = async (data) => {
  try {
    const response = await api.post("/employee-attendance/manual", data);
    return response.data;
  } catch (error) {
    console.error("Error creating employee attendance:", error);
    throw error;
  }
};

export const updateAttendance = async (id, data) => {
  try {
    const response = await api.put(`/employee_attendances/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating employee attendance:", error);
    throw error;
  }
};

export const deleteAttendance = async (id) => {
  try {
    const response = await api.delete(`/employee_attendances/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee attendance:", error);
    throw error;
  }
};

export const fetchAttendanceRange = async (params) => {
  try {
    const response = await api.get("/employee-attendance/range", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching employee attendance summary:", error);
    throw error;
  }
};
