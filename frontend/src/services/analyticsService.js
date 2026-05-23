/**
 * Analytics service — aggregate stats and chart data.
 *
 * All functions accept an optional `academicYear` parameter.
 * When provided, it is sent as `?academic_year=<value>` to scope data.
 */
import api from "./api";

/**
 * Build query params object from optional academic year.
 * @param {string|null} academicYear
 * @returns {object} axios params config
 */
const _params = (academicYear) =>
  academicYear ? { params: { academic_year: academicYear } } : {};

/**
 * GET /analytics/summary
 * @param {string|null} academicYear
 * @returns {{ total_companies: number, total_rounds: number, selection_rate: number, scope: string }}
 */
export const getSummary = async (academicYear = null) => {
  const { data } = await api.get("/analytics/summary", _params(academicYear));
  return data;
};

/**
 * GET /analytics/packages
 * @param {string|null} academicYear
 * @returns {{ company: string, avg_ctc: number, min_ctc: number, max_ctc: number }[]}
 */
export const getPackages = async (academicYear = null) => {
  const { data } = await api.get("/analytics/packages", _params(academicYear));
  return data;
};

/**
 * GET /analytics/company-frequency
 * @param {string|null} academicYear
 * @returns {{ company: string, record_count: number }[]}
 */
export const getCompanyFrequency = async (academicYear = null) => {
  const { data } = await api.get("/analytics/company-frequency", _params(academicYear));
  return data;
};

/**
 * GET /analytics/top-companies
 * @param {string|null} academicYear
 * @returns {{ company: string, visit_count: number }[]}
 */
export const getTopCompanies = async (academicYear = null) => {
  const { data } = await api.get("/analytics/top-companies", _params(academicYear));
  return data;
};

/**
 * GET /analytics/dropout-rates
 * @param {string|null} academicYear
 * @returns {{ round_type: string, total: number, failed: number, dropout_rate_percent: number }[]}
 */
export const getDropoutRates = async (academicYear = null) => {
  const { data } = await api.get("/analytics/dropout-rates", _params(academicYear));
  return data;
};

/**
 * GET /analytics/my-round-performance
 * @param {string|null} academicYear
 * @returns {{ round_type: string, total: number, failed: number, dropout_rate_percent: number }[]}
 */
export const getMyRoundPerformance = async (academicYear = null) => {
  const { data } = await api.get("/analytics/my-round-performance", _params(academicYear));
  return data;
};
