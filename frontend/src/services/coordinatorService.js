/**
 * Coordinator service — API calls for coordinator-only endpoints.
 */
import api from "./api";

/**
 * GET /coordinator/students
 * @returns {{ id, email, full_name, created_at, record_count }[]}
 */
export const getStudents = async () => {
  const { data } = await api.get("/coordinator/students");
  return data;
};

/**
 * PATCH /coordinator/records/:id/status
 * @param {number} recordId
 * @param {"coordinator_approved"|"coordinator_rejected"} status
 */
export const updateRecordStatus = async (recordId, status) => {
  const { data } = await api.patch(`/coordinator/records/${recordId}/status`, { status });
  return data;
};

/**
 * DELETE /coordinator/students/:id
 * @param {number} userId
 */
export const deleteStudent = async (userId) => {
  const { data } = await api.delete(`/coordinator/students/${userId}`);
  return data;
};
