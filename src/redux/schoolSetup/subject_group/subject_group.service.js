import api from "../../../common/services/api";

export const getSubjectGroups = async (schoolId) => {
  try {
    const response = await api.get(`/subject-groups/token`, {
      params: {
        school_id: schoolId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching subject groups:", error);
    throw error;
  }
};

export const getSubjectGroupById = async (subjectGroupId) => {
  try {
    const response = await api.get(`/subject-groups/${subjectGroupId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subject group:", error);
    throw error;
  }
};

export const createSubjectGroup = async (subjectGroupData) => {
  try {
    const response = await api.post(`/subject-groups`, subjectGroupData);
    return response.data;
  } catch (error) {
    console.error("Error creating subject group:", error);
    throw error;
  }
};

export const updateSubjectGroup = async (subjectGroupId, subjectGroupData) => {
  try {
    const response = await api.put(
      `/subject-groups/${subjectGroupId}`,
      subjectGroupData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating subject group:", error);
    throw error;
  }
};

export const deleteSubjectGroup = async (subjectGroupId) => {
  try {
    const response = await api.delete(`/subject-groups/${subjectGroupId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting subject group:", error);
    throw error;
  }
};

export const checkSubjectGroupExists = async ({ school_id, name }) => {
  try {
    const response = await api.get("/subject-groups/check-subject-group", {
      params: {
        school_id,
        name,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error checking subject group:", error);
    throw error;
  }
};
