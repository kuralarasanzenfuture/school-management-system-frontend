import api from "../../../common/services/api";

export const loginApi = (data) => {
  return api.post("/users/login", data);
};