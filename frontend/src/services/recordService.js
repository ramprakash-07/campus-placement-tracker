/**
 * Placement Record service — CRUD operations for PlacementRecord resources.
 */
import api from "./api";

/**
 * GET /placement-records
 * @param {object} [options] — { page, limit }
 * @returns {{ data: object[], total: number, page: number, pages: number }}
 */
export const getRecords = async ({ page = 1, limit = 10 } = {}) => {
  const { data } = await api.get("/placement-records", { params: { page, limit } });
  return data;
};

/**
 * GET /placement-records/:id
 * @param {number} id
 * @returns {object} single placement record
 */
export const getRecord = async (id) => {
  const { data } = await api.get(`/placement-records/${id}`);
  return data;
};

/**
 * POST /placement-records
 * @param {{ company_id: number, status?: string, ctc_offered?: number }} payload
 * @returns {object} created placement record
 */
export const createRecord = async (payload) => {
  const { data } = await api.post("/placement-records", payload);
  return data;
};

/**
 * PUT /placement-records/:id
 * @param {number} id
 * @param {{ status?: string, ctc_offered?: number }} payload
 * @returns {object} updated placement record
 */
export const updateRecord = async (id, payload) => {
  const { data } = await api.put(`/placement-records/${id}`, payload);
  return data;
};

/**
 * DELETE /placement-records/:id
 * @param {number} id
 */
export const deleteRecord = async (id) => {
  await api.delete(`/placement-records/${id}`);
};

/**
 * GET /placement-records/export
 * @returns {Blob} CSV file as a Blob
 */
export const exportRecordsCsv = async () => {
  const { data } = await api.get("/placement-records/export", {
    responseType: "blob",
  });
  return data;
};
