/**
 * Placement Record service — CRUD operations for PlacementRecord resources.
 */
import api from "./api";

/**
 * GET /placement-records
 * @returns {object[]} current user's placement records (with nested company & rounds)
 */
export const getRecords = async () => {
  const { data } = await api.get("/placement-records");
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
