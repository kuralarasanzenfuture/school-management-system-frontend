import api from "../../../common/services/api";

export const getSubjects = async (schoolId) => {
  try {
    const response = await api.get(`/subjects/token`, {
      params: {
        school_id: schoolId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

export const getSubjectById = async (subjectId) => {
  try {
    const response = await api.get(`/subjects/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subject:", error);
    throw error;
  }
};

export const createSubject = async (subjectData) => {
  try {
    const response = await api.post(`/subjects`, subjectData);
    return response.data;
  } catch (error) {
    console.error("Error creating subject:", error);
    throw error;
  }
};

export const updateSubject = async (subjectId, subjectData) => {
  try {
    const response = await api.put(`/subjects/${subjectId}`, subjectData);
    return response.data;
  } catch (error) {
    console.error("Error updating subject:", error);
    throw error;
  }
};

export const deleteSubject = async (subjectId) => {
  try {
    const response = await api.delete(`/subjects/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting subject:", error);
    throw error;
  }
};

export const checkSubjectExists = async ({ school_id, name, code }) => {
  try {
    const response = await api.get("/subjects/check-subject", {
      params: {
        school_id,
        name,
        code,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error checking subject:", error);
    throw error;
  }
};
