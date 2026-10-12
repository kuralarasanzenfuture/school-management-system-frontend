import api from "../../../common/services/api";

export const getSubjectGroups = async (params = {}) => {
  try {
    let queryParams = {};
    if (params && typeof params === "object") {
      queryParams = params;
    } else if (params) {
      queryParams = { school_id: params };
    }

    const response = await api.get(`/subject-groups/token`, {
      params: queryParams,
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

export const updateSubjectGroupStatus = async (subjectGroupId, status) => {
  try {
    const response = await api.patch(
      `/subject-groups/status/${subjectGroupId}`,
      { status },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating subject group status:", error);
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

export const checkSubjectGroupExists = async ({ school_id, name, id = null }) => {
  try {
    const params = { school_id, name };
    if (id) params.id = id;

    const response = await api.get("/subject-groups/check-subject-group", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error checking subject group:", error);
    throw error;
  }
};
