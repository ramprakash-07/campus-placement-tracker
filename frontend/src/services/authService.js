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

/**
 * POST /auth/forgot-password
 * @param {{ email: string }} payload
 */
export const forgotPassword = async (payload) => {
  const { data } = await api.post("/auth/forgot-password", payload);
  return data;
};

/**
 * POST /auth/reset-password
 * @param {{ email: string, otp: string, new_password: string }} payload
 */
export const resetPassword = async (payload) => {
  const { data } = await api.post("/auth/reset-password", payload);
  return data;
};
