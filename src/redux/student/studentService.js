import api from "../../common/services/api";

const getStudents = async (params = {}) => {
  const response = await api.get("/students/token", { params });
  return response.data;
};

const getNonAdmissionStudents = async (params = {}) => {
  const response = await api.get("/students/non-admissions/token", { params });
  return response.data;
};

const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

const createStudent = async (studentData) => {
  const response = await api.post("/students", studentData);
  return response.data;
};

const updateStudent = async ({ id, formData }) => {
  const response = await api.put(`/students/${id}`, formData);
  return response.data;
};

const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

const updateStudentStatus = async ({ id, status }) => {
  const response = await api.patch(`/students/status/${id}`, { status });
  return response.data;
};

export default {
  getStudents,
  getNonAdmissionStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
};
