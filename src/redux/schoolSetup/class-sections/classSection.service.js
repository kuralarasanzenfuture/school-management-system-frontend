import api from "../../../common/services/api";

export const getAllClassSections = async (params = {}) => {
  try {
    const response = await api.get(`/class-sections/token`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching class sections:", error);
    throw error;
  }
};

export const getClassSectionById = async (id) => {
  try {
    const response = await api.get(`/class-sections/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching class section:", error);
    throw error;
  }
};

export const createClassSection = async (classSectionData) => {
  try {
    const response = await api.post("/class-sections", classSectionData);
    return response.data;
  } catch (error) {
    console.error("Error creating class section:", error);
    throw error;
  }
};

export const updateClassSection = async (id, classSectionData) => {
  try {
    const response = await api.put(`/class-sections/${id}`, classSectionData);
    return response.data;
  } catch (error) {
    console.error("Error updating class section:", error);
    throw error;
  }
};

export const updateClassSectionStatus = async (id, status) => {
  try {
    const response = await api.patch(`/class-sections/status/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating class section status:", error);
    throw error;
  }
};

export const deleteClassSection = async (id) => {
  try {
    const response = await api.delete(`/class-sections/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting class section:", error);
    throw error;
  }
};
