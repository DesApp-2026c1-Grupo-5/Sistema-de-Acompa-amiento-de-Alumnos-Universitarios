import { api } from "./api";

export const getPosts = ({ page = 1, limit = 10 } = {}) =>
  api.get(`/posts?page=${page}&limit=${limit}`);

export const getPost = (id) => api.get(`/posts/${id}`);

export const createPost = (contenido) => api.post("/posts", { contenido });

export const votePost = (postId, tipo) =>
  api.post(`/posts/${postId}/voto`, { tipo });

export const deletePost = (postId) => api.delete(`/posts/${postId}`);
