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
    const response = await api.post("/students-attendance/mark", payload);
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
    const response = await api.patch(`/students-attendance/session/${id}/lock`);
    return response.data;
  } catch (error) {
    console.error("Error locking attendance session:", error);
    throw error;
  }
};

// ================= UNLOCK =================
export const unlockAttendanceSession = async (id) => {
  try {
    const response = await api.patch(
      `/students-attendance/session/${id}/unlock`,
    );
    return response.data;
  } catch (error) {
    console.error("Error unlocking attendance session:", error);
    throw error;
  }
};

// ================= STUDENT ATTENDANCE =================
export const getAttendanceByStudentId = async (studentId, filters = {}) => {
  try {
    const params = {};

    if (filters.from_date) {
      params.from_date = filters.from_date;
    }

    if (filters.to_date) {
      params.to_date = filters.to_date;
    }

    if (filters.academic_year_id) {
      params.academic_year_id = filters.academic_year_id;
    }

    if (filters.attendance_type) {
      params.attendance_type = Array.isArray(filters.attendance_type)
        ? filters.attendance_type.join(",")
        : filters.attendance_type;
    }

    const response = await api.get(
      `/students-attendance/student/${studentId}`,
      {
        params,
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    throw error;
  }
};
