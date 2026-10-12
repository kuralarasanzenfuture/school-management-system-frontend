import api from "../../../common/services/api";

export const getAcademicYears = async (params = {}) => {
  try {
    const response = await api.get("/academic-years/token", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching academic years:", error);
    throw error;
  }
};

export const getAllAcademicYears = async (params = {}) => {
  try {
    const response = await api.get("/academic-years", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching all academic years:", error);
    throw error;
  }
};

export const getAcademicYearsBySchool = async (schoolId, params = {}) => {
  try {
    const response = await api.get(`/academic-years/school/${schoolId}`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching academic years by school:", error);
    throw error;
  }
};

export const getAcademicYearById = async (id) => {
  try {
    const response = await api.get(`/academic-years/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching academic year:", error);
    throw error;
  }
};

export const createAcademicYear = async (academicYearData) => {
  try {
    const response = await api.post("/academic-years", academicYearData);
    return response.data;
  } catch (error) {
    console.error("Error creating academic year:", error);
    throw error;
  }
};

export const updateAcademicYear = async (id, formData) => {
  try {
    const response = await api.put(`/academic-years/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error updating academic year:", error);
    throw error;
  }
};

export const updateAcademicYearStatus = async (id, status) => {
  try {
    const response = await api.patch(`/academic-years/status/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating academic year status:", error);
    throw error;
  }
};

export const deleteAcademicYear = async (id) => {
  try {
    const response = await api.delete(`/academic-years/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting academic year:", error);
    throw error;
  }
};

export const checkAcademicYearExists = async (schoolId, name, excludeId = null) => {
  try {
    const params = { school_id: schoolId, name };
    if (excludeId) params.id = excludeId;
    const response = await api.get("/academic-years/check-year", { params });
    return response.data;
  } catch (error) {
    console.error("Error checking academic year existence:", error);
    throw error;
  }
};

export const checkAcademicYearExistsByToken = async (name, excludeId = null) => {
  try {
    const params = { name };
    if (excludeId) params.id = excludeId;
    const response = await api.get("/academic-years/check-year/token", { params });
    return response.data;
  } catch (error) {
    console.error("Error checking academic year existence by token:", error);
    throw error;
  }
};
