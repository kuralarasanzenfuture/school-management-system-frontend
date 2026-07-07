import api from "../../../common/services/api";

const getClasses = async () => {
  try {
    const response = await api.get("/classes/token");
    return response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const getClassById = async (id) => {
  try {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching class:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const getClassesBySchoolId = async (schoolId) => {
  try {
    const response = await api.get(`/classes/school/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const createClass = async (classData) => {
  try {
    const response = await api.post("/classes", classData);
    return response.data;
  } catch (error) {
    console.error("Error creating class:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const updateClass = async (id, formData) => {
  try {
    const response = await api.put(`/classes/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error updating class:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const deleteClass = async (id) => {
  try {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

const checkClassExists = async (schoolId, name) => {
  try {
    const response = await api.get("/classes/check-class", {
      params: {
        school_id: schoolId,
        name,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error checking class existence:", error);
    throw error;
  }
};

export {
  getClasses,
  getClassById,
  getClassesBySchoolId,
  createClass,
  updateClass,
  deleteClass,
  checkClassExists,
};
