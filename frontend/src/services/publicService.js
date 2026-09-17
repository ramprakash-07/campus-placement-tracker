/**
 * Public API service — calls /public endpoints (no auth required).
 */
import api from "./api";

export const getPublicCompanies = async () => {
  const { data } = await api.get("/public/companies");
  return data;
};

export const getPublicRecords = async () => {
  const { data } = await api.get("/public/records");
  return data;
};

export const getPublicSummary = async () => {
  const { data } = await api.get("/public/analytics/summary");
  return data;
};

export const getPublicTopCompanies = async () => {
  const { data } = await api.get("/public/analytics/top-companies");
  return data;
};

export const getPublicQuestionBank = async () => {
  const { data } = await api.get("/public/question-bank");
  return data;
};
