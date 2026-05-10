/**
 * Round service — CRUD operations for Round resources.
 */
import api from "./api";

/**
 * GET /rounds/:placementRecordId
 * @param {number} placementRecordId
 * @returns {object[]} rounds for the given placement record
 */
export const getRounds = async (placementRecordId) => {
  const { data } = await api.get(`/rounds/${placementRecordId}`);
  return data;
};

/**
 * POST /rounds
 * @param {{ placement_record_id: number, round_type: string, round_number?: number, outcome?: string, notes?: string }} payload
 * @returns {object} created round
 */
export const createRound = async (payload) => {
  const { data } = await api.post("/rounds", payload);
  return data;
};

/**
 * PUT /rounds/:id
 * @param {number} id
 * @param {{ round_type?: string, outcome?: string, notes?: string }} payload
 * @returns {object} updated round
 */
export const updateRound = async (id, payload) => {
  const { data } = await api.put(`/rounds/${id}`, payload);
  return data;
};

/**
 * DELETE /rounds/:id
 * @param {number} id
 */
export const deleteRound = async (id) => {
  await api.delete(`/rounds/${id}`);
};
