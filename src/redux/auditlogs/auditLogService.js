import api from "../../common/services/api";

/**
 * Audit Log Service
 * Handles communication with backend audit-logs endpoints:
 * - GET /audit-logs       (fetch paginated and filtered audit logs)
 * - GET /audit-logs/:id   (fetch single audit log by ID with field change diffs)
 */

export const getAuditLogs = async (params = {}) => {
  const response = await api.get("/audit-logs", { params });
  return response.data;
};

export const getAuditLogById = async (id) => {
  const response = await api.get(`/audit-logs/${id}`);
  return response.data;
};

export default {
  getAuditLogs,
  getAuditLogById,
};
