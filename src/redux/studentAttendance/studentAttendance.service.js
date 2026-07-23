import api from "../../common/services/api";

// ================= GET ALL =================
export const getAllAttendance = async (filters = {}) => {
  try {
    const response = await api.get("/students-attendance", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
};

// ================= GET BY TOKEN =================
export const getAllAttendanceByToken = async (filters = {}) => {
  try {
    const response = await api.get("/students-attendance/token", {
      params: filters,
    });
    console.log("getAllAttendanceByToken response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
};

// ================= MARK ATTENDANCE =================
export const markAttendance = async (payload) => {
  try {
    const response = await api.post("/students-attendance", payload);
    return response.data;
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
};

// ================= GET SESSION =================
export const getAttendanceBySessionId = async (id) => {
  try {
    const response = await api.get(`/students-attendance/session/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance session:", error);
    throw error;
  }
};

// ================= GET BY ID =================
export const getAttendanceById = async (id) => {
  try {
    const response = await api.get(`/students-attendance/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
};

// ================= UPDATE =================
export const updateAttendance = async (id, payload) => {
  try {
    const response = await api.put(`/students-attendance/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating attendance:", error);
    throw error;
  }
};

// ================= DELETE =================
export const deleteAttendance = async (id) => {
  try {
    const response = await api.delete(`/students-attendance/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting attendance:", error);
    throw error;
  }
};

// ================= LOCK =================
export const lockAttendanceSession = async (id) => {
  try {
    const response = await api.put(`/students-attendance/${id}/lock`);
    return response.data;
  } catch (error) {
    console.error("Error locking attendance session:", error);
    throw error;
  }
};

// ================= UNLOCK =================
export const unlockAttendanceSession = async (id) => {
  try {
    const response = await api.put(`/students-attendance/${id}/unlock`);
    return response.data;
  } catch (error) {
    console.error("Error unlocking attendance session:", error);
    throw error;
  }
};

// ================= STUDENT ATTENDANCE =================
export const getAttendanceByStudentId = async (id) => {
  try {
    const response = await api.get(`/students-attendance/student/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    throw error;
  }
};

