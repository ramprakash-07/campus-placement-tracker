/**
 * Analytics service — aggregate stats and chart data.
 */
import api from "./api";

/**
 * GET /analytics/summary
 * @returns {{ total_companies: number, total_rounds: number, selection_rate: number }}
 */
export const getSummary = async () => {
  const { data } = await api.get("/analytics/summary");
  return data;
};

/**
 * GET /analytics/packages
 * @returns {{ company: string, avg_ctc: number, min_ctc: number, max_ctc: number }[]}
 */
export const getPackages = async () => {
  const { data } = await api.get("/analytics/packages");
  return data;
};

/**
 * GET /analytics/company-frequency
 * @returns {{ company: string, record_count: number }[]}
 */
export const getCompanyFrequency = async () => {
  const { data } = await api.get("/analytics/company-frequency");
  return data;
};

/**
 * GET /analytics/top-companies
 * @returns {{ company: string, visit_count: number }[]}
 */
export const getTopCompanies = async () => {
  const { data } = await api.get("/analytics/top-companies");
  return data;
};

/**
 * GET /analytics/dropout-rates
 * @returns {{ round_type: string, total: number, failed: number, dropout_rate_percent: number }[]}
 */
export const getDropoutRates = async () => {
  const { data } = await api.get("/analytics/dropout-rates");
  return data;
};

/**
 * GET /analytics/my-round-performance
 * @returns {{ round_type: string, total: number, failed: number, dropout_rate_percent: number }[]}
 */
export const getMyRoundPerformance = async () => {
  const { data } = await api.get("/analytics/my-round-performance");
  return data;
};
