import api from "../../../common/services/api";

const getClasses = async (params = {}) => {
  try {
    const response = await api.get("/classes/token", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

const getAllClasses = async (params = {}) => {
  try {
    const response = await api.get("/classes", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching all classes:", error);
    throw error;
  }
};

const getClassById = async (id) => {
  try {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching class:", error);
    throw error;
  }
};

const getClassesBySchoolId = async (schoolId, params = {}) => {
  try {
    const response = await api.get(`/classes/school/${schoolId}`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching classes by school:", error);
    throw error;
  }
};

const createClass = async (classData) => {
  try {
    const response = await api.post("/classes", classData);
    return response.data;
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
};

const updateClass = async (id, formData) => {
  try {
    const response = await api.put(`/classes/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error updating class:", error);
    throw error;
  }
};

const updateClassStatus = async (id, status) => {
  try {
    const response = await api.patch(`/classes/status/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating class status:", error);
    throw error;
  }
};

const deleteClass = async (id) => {
  try {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
};

const checkClassExists = async (schoolId, name, excludeId = null) => {
  try {
    const params = {
      school_id: schoolId,
      name,
    };
    if (excludeId) {
      params.id = excludeId;
    }
    const response = await api.get("/classes/check-class", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error checking class existence:", error);
    throw error;
  }
};

const checkClassExistsByToken = async (name, excludeId = null, schoolId = null) => {
  try {
    const params = { name };
    if (excludeId) {
      params.id = excludeId;
    }
    if (schoolId) {
      params.school_id = schoolId;
    }
    const response = await api.get("/classes/check-class/token", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error checking class existence by token:", error);
    throw error;
  }
};

export {
  getClasses,
  getAllClasses,
  getClassById,
  getClassesBySchoolId,
  createClass,
  updateClass,
  updateClassStatus,
  deleteClass,
  checkClassExists,
  checkClassExistsByToken,
};
