import api from "../../common/services/api";

/**
 * Fetch student admissions by authenticated user's token/scope with optional filters.
 * Backend route: GET /student-admissions/token
 */
export const getStudentAdmissions = async (filters = {}) => {
  try {
    const response = await api.get(`/student-admissions/token`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching student admissions:", error);
    throw error;
  }
};

/**
 * Fetch all student admissions with optional query filters (direct admin route).
 * Backend route: GET /student-admissions
 */
export const getAllStudentAdmissions = async (filters = {}) => {
  try {
    const response = await api.get(`/student-admissions`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all student admissions:", error);
    throw error;
  }
};

/**
 * Fetch single student admission by ID.
 * Backend route: GET /student-admissions/:id
 */
export const getStudentAdmissionById = async (id) => {
  try {
    const response = await api.get(`/student-admissions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student admission by ID:", error);
    throw error;
  }
};

/**
 * Create a new student admission record (and optional initial section allocation).
 * Backend route: POST /student-admissions
 */
export const createStudentAdmission = async (studentData) => {
  try {
    const response = await api.post(`/student-admissions`, studentData);
    return response.data;
  } catch (error) {
    console.error("Error creating student admission:", error);
    throw error;
  }
};

/**
 * Update an existing student admission record.
 * Backend route: PUT /student-admissions/:id
 */
export const updateStudentAdmission = async (id, studentData) => {
  try {
    const response = await api.put(`/student-admissions/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error("Error updating student admission:", error);
    throw error;
  }
};

/**
 * Delete a student admission record.
 * Backend route: DELETE /student-admissions/:id
 */
export const deleteStudentAdmission = async (id) => {
  try {
    const response = await api.delete(`/student-admissions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting student admission:", error);
    throw error;
  }
};

/**
 * Fetch class and section student summary & student roster by token.
 * Backend route: GET /student-admissions/token/class-summary
 */
export const getClassStudentSummaryByToken = async (filters = {}) => {
  try {
    const response = await api.get(`/student-admissions/token/class-summary`, {
      params: {
        include_students: true,
        ...filters,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching class student summary:", error);
    throw error;
  }
};

/**
 * Fetch admissions report with filters (school_id, academic_year_id, class_id, status, from_date, to_date).
 * Backend route: GET /student-admissions/report
 */
export const getAllStudentAdmissionsReport = async (filters = {}) => {
  try {
    const response = await api.get(`/student-admissions/report`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admissions report:", error);
    throw error;
  }
};
