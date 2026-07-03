import api from "../../common/services/api";

const getStudents = async () => {
  const response = await api.get("/students/token");
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

export default {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
