/**
 * Question bank + Activity services.
 */
import api from "./api";

/** GET /question-bank */
export const getQuestionBank = async ({ round_type, company_id, page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  if (round_type) params.round_type = round_type;
  if (company_id) params.company_id = company_id;
  const { data } = await api.get("/question-bank", { params });
  return data;
};

/** GET /activity */
export const getActivityFeed = async () => {
  const { data } = await api.get("/activity");
  return data;
};
