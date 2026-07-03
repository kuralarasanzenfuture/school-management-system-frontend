import api from "../../../common/services/api";

// export const getSections = async (schoolId, classId) => {
//   try {
//     const response = await api.get(`/sections`, {
//       params: {
//         school_id: schoolId,
//         class_id: classId,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching sections:", error);
//     throw error;
//   }
// };

export const getSections = async (schoolId, classId) => {
  try {
    const response = await api.get(`/sections/token`, {
      params: {
        school_id: schoolId,
        class_id: classId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sections:", error);
    throw error;
  }
};

export const getSectionsTree = async (schoolId, classId) => {
  try {
    const response = await api.get(`/sections/tree`, {
      params: {
        school_id: schoolId,
        class_id: classId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sections tree:", error);
    throw error;
  }
};

export const getSectionById = async (sectionId) => {
  try {
    const response = await api.get(`/sections/${sectionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching section:", error);
    throw error;
  }
};

export const getSectionByClassId = async (classId) => {
  try {
    const response = await api.get(`/sections/class/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sections by class ID:", error);
    throw error;
  }
};

export const createSection = async (sectionData) => {
  try {
    const response = await api.post(`/sections`, sectionData);
    return response.data;
  } catch (error) {
    console.error("Error creating section:", error);
    throw error;
  }
};

export const updateSection = async (sectionId, sectionData) => {
  try {
    const response = await api.put(`/sections/${sectionId}`, sectionData);
    return response.data;
  } catch (error) {
    console.error("Error updating section:", error);
    throw error;
  }
};

export const deleteSection = async (sectionId) => {
  try {
    const response = await api.delete(`/sections/${sectionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting section:", error);
    throw error;
  }
};
