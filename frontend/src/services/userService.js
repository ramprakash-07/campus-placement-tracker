/**
 * User service — profile and password management API calls.
 */
import api from "./api";

/**
 * GET /users/me
 * @returns {object} current user profile
 */
export const getMe = async () => {
  const { data } = await api.get("/users/me");
  return data;
};

/**
 * PUT /users/me
 * @param {{ full_name: string }} payload
 * @returns {object} updated user profile
 */
export const updateProfile = async (payload) => {
  const { data } = await api.put("/users/me", payload);
  return data;
};

/**
 * PUT /users/me/password
 * @param {{ old_password: string, new_password: string }} payload
 * @returns {object} updated user profile
 */
export const changePassword = async (payload) => {
  const { data } = await api.put("/users/me/password", payload);
  return data;
};
