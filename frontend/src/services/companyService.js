/**
 * Company service — CRUD operations for Company resources.
 */
import api from "./api";

/**
 * GET /companies
 * @param {object} [options] — { search, page, limit }
 * @returns {{ data: object[], total: number, page: number, pages: number }}
 */
export const getCompanies = async ({ search, page = 1, limit = 10 } = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  const { data } = await api.get("/companies", { params });
  return data;
};

/**
 * GET /companies/:id
 * @param {number} id
 * @returns {object} single company
 */
export const getCompany = async (id) => {
  const { data } = await api.get(`/companies/${id}`);
  return data;
};

/**
 * POST /companies
 * @param {{ name: string, industry?: string, website?: string }} payload
 * @returns {object} created company
 */
export const createCompany = async (payload) => {
  const { data } = await api.post("/companies", payload);
  return data;
};

/**
 * PUT /companies/:id
 * @param {number} id
 * @param {{ name?: string, industry?: string, website?: string }} payload
 * @returns {object} updated company
 */
export const updateCompany = async (id, payload) => {
  const { data } = await api.put(`/companies/${id}`, payload);
  return data;
};

/**
 * DELETE /companies/:id
 * @param {number} id
 */
export const deleteCompany = async (id) => {
  await api.delete(`/companies/${id}`);
};
