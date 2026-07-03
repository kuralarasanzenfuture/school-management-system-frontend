import api from "../../../common/services/api";

export const getAcademicYears = async () => {
  try {
    const response = await api.get("/academic-years/token");
    return response.data;
  } catch (error) {
    console.error("Error fetching academic years:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const getAcademicYearById = async (id) => {
  try {
    const response = await api.get(`/academic-years/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching academic year:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const createAcademicYear = async (academicYearData) => {
  try {
    const response = await api.post("/academic-years", academicYearData);
    return response.data;
  } catch (error) {
    console.error("Error creating academic year:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const updateAcademicYear = async (id, formData) => {
  try {
    const response = await api.put(`/academic-years/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error updating academic year:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const deleteAcademicYear = async (id) => {
  try {
    const response = await api.delete(`/academic-years/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting academic year:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};
