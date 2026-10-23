import api from "../../common/services/api";

/**
 * Fetch section allocations by authenticated user's token/scope with optional filters.
 * Backend route: GET /student-section-allocations/token
 * Supported filters:
 * - admission_id, student_id, class_section_id, class_id, section_id,
 *   academic_year_id, school_id, status, active_only, roll_no
 */
export const getAllSectionAllocationsByToken = async (filters = {}) => {
  try {
    const response = await api.get(`/student-section-allocations/token`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching section allocations by token:", error);
    throw error;
  }
};

/**
 * Fetch all section allocations with optional query filters.
 * Primary: uses /student-section-allocations/token, with fallback to /student-section-allocations.
 */
export const getAllSectionAllocations = async (filters = {}) => {
  try {
    const response = await api.get(`/student-section-allocations/token`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      const fallback = await api.get(`/student-section-allocations`, {
        params: filters,
      });
      return fallback.data;
    }
    console.error("Error fetching section allocations:", error);
    throw error;
  }
};

/**
 * Check if a student already has an active section allocation (token-scoped).
 * Backend route: GET /student-section-allocations/check-allocation/token
 */
export const checkExistingSectionAllocationByToken = async (params = {}) => {
  try {
    const response = await api.get(`/student-section-allocations/check-allocation/token`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error checking section allocation by token:", error);
    throw error;
  }
};

/**
 * Check if a student already has an active section allocation (direct route).
 * Backend route: GET /student-section-allocations/check-allocation
 */
export const checkExistingSectionAllocation = async (params = {}) => {
  try {
    const response = await api.get(`/student-section-allocations/check-allocation`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error checking section allocation:", error);
    throw error;
  }
};

/**
 * Fetch a single section allocation by ID.
 * Backend route: GET /student-section-allocations/:id
 */
export const getSectionAllocationById = async (id) => {
  try {
    const response = await api.get(`/student-section-allocations/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching section allocation by ID:", error);
    throw error;
  }
};

/**
 * Create a new section allocation.
 * Backend route: POST /student-section-allocations
 * Body: { admission_id, student_id, class_section_id, roll_no, allocation_date, effective_to, status, remarks }
 */
export const createSectionAllocation = async (data) => {
  try {
    const response = await api.post(`/student-section-allocations`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating section allocation:", error);
    throw error;
  }
};

/**
 * Update an existing section allocation.
 * Backend route: PUT /student-section-allocations/:id
 * Body: { class_section_id, roll_no, allocation_date, effective_to, status, remarks }
 */
export const updateSectionAllocation = async (id, data) => {
  try {
    const response = await api.put(`/student-section-allocations/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating section allocation:", error);
    throw error;
  }
};

/**
 * Delete a section allocation by ID.
 * Backend route: DELETE /student-section-allocations/:id
 */
export const deleteSectionAllocation = async (id) => {
  try {
    const response = await api.delete(`/student-section-allocations/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting section allocation:", error);
    throw error;
  }
};
