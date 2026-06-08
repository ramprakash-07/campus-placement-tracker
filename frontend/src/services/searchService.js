/**
 * Search service — global search API call.
 */
import api from "./api";

/**
 * GET /search?q=<query>
 * @param {string} query
 * @returns {{ companies: object[], records: object[], rounds: object[] }}
 */
export const globalSearch = async (query) => {
  const { data } = await api.get("/search", { params: { q: query } });
  return data;
};
