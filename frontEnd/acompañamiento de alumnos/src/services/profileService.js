import { api } from "./api";

export const getMyProfile = () => api.get("/profile/me");

export const updateMyPrivacy = (privacidad) =>
  api.patch("/profile/me/privacy", { privacidad });
