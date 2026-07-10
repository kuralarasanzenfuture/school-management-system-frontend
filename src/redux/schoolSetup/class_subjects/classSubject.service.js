import api from "../../../common/services/api";

export const getAllClassSubjects = async () => {
    try {
        const response = await api.get(`/class-subjects/token`);
        return response.data;
    } catch (error) {
        console.error("Error fetching class subjects:", error);
        throw error;
    }
};

export const getClassSubjectById = async (id) => {
    try {
        const response = await api.get(`/class-subjects/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching class subject:", error);
        throw error;
    }
};

export const createClassSubject = async (classSubjectData) => {
    try {
        const response = await api.post("/class-subjects", classSubjectData);
        return response.data;
    } catch (error) {
        console.error("Error creating class subject:", error);
        throw error;
    }
};

export const bulkAssignSubjects = async (data) => {
  try {
    const response = await api.post("/class-subjects/bulk-assign-subjects", data);
    return response.data;
  } catch (error) {
    console.error("Error bulk assigning subjects:", error);
    throw error;
  }
}

export const updateClassSubject = async (id, classSubjectData) => {
    try {
        const response = await api.put(`/class-subjects/${id}`, classSubjectData);
        return response.data;
    } catch (error) {
        console.error("Error updating class subject:", error);
        throw error;
    }
};

export const deleteClassSubject = async (id) => {
    try {
        const response = await api.delete(`/class-subjects/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting class subject:", error);
        throw error;
    }
};

