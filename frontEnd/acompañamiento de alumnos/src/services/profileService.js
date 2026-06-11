import { api } from "./api";

export const getMyProfile = () => api.get("/profile/me");
export const getProfileById = (id) => api.get(`/profile/${id}`);

export const updateMyPrivacy = (privacidad) =>
  api.patch("/profile/me/privacy", { privacidad });

export const updateMyProfile = (payload) => api.put("/profile/me", payload);

export const uploadAvatar = (file) => {
  const fd = new FormData();
  fd.append("foto", file);
  return api.postFormData("/profile/me/avatar", fd);
};

export const deleteAvatar = () => api.delete("/profile/me/avatar");

export const uploadBanner = (file) => {
  const fd = new FormData();
  fd.append("banner", file);
  return api.postFormData("/profile/me/banner", fd);
};

export const deleteBanner = () => api.delete("/profile/me/banner");
