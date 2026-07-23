import api from "../../common/services/api";

export const getStudentAdmissions = async () => {
  try {
    const response = await api.get(`/student-admissions/token`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sections:", error);
    throw error;
  }
};

export const getStudentAdmissionById = async (id) => {
  try {
    const response = await api.get(`/student-admissions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching section:", error);
    throw error;
  }
};

export const createStudentAdmission = async (studentData) => {
  try {
    const response = await api.post(`/student-admissions`, studentData);
    return response.data;
  } catch (error) {
    console.error("Error creating section:", error);
    throw error;
  }
};

export const updateStudentAdmission = async (id, studentData) => {
  try {
    const response = await api.put(`/student-admissions/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error("Error updating section:", error);
    throw error;
  }
};

export const deleteStudentAdmission = async (id) => {
  try {
    const response = await api.delete(`/student-admissions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting section:", error);
    throw error;
  }
};

export const getClassStudentSummaryByToken = async (filters) => {
  try {
    const response = await api.get(`/student-admissions/token`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sections:", error);
    throw error;
  }
};
