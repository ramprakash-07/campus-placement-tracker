/**
 * Bookmark service — toggle and list bookmarked companies.
 */
import api from "./api";

/** POST /bookmarks?company_id=<id> — toggle bookmark */
export const toggleBookmark = async (companyId) => {
  const { data } = await api.post("/bookmarks", null, {
    params: { company_id: companyId },
  });
  return data;
};

/** GET /bookmarks — list bookmarked companies */
export const getBookmarks = async () => {
  const { data } = await api.get("/bookmarks");
  return data;
};
