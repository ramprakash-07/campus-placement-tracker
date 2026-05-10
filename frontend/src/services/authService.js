/**
 * Auth service — login and registration API calls.
 */
import api from "./api";

/**
 * POST /auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {{ access_token: string, token_type: string }}
 */
export const login = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

/**
 * POST /auth/register
 * @param {{ email: string, full_name: string, password: string }} payload
 * @returns {object} created user
 */
export const register = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};
