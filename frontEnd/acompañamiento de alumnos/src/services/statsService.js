import { api } from "./api";

export const getAdminStats = (
  ratingOrder = "default"
) =>
  api.get(
    `/admin/stats?ratingOrder=${ratingOrder}`
  );
