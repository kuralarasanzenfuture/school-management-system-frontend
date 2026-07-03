import api from "../../../common/services/api";

const getSchool = async () => {
  try {
    const response = await api.get("/schools/token");
    return response.data;
  } catch (error) {
    console.error("Error fetching school profile:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const getSchoolById = async (id) => {
  try {
    const response = await api.get(`/schools/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching school profile:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const createSchool = async (schoolData) => {
  try {
    const response = await api.post("/schools", schoolData);
    return response.data;
  } catch (error) {
    console.error("Error creating school profile:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const updateSchool = async (id, formData) => {
  try {
    const response = await api.put(`/schools/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error updating school profile:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const deleteSchool = async (id) => {
  try {
    const response = await api.delete(`/schools/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting school profile:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export { getSchool, getSchoolById, createSchool, updateSchool, deleteSchool };
