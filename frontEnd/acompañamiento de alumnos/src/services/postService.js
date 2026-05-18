import { api } from "./api";

export const getPosts = () => api.get("/posts");

export const createPost = (contenido) => api.post("/posts", { contenido });

export const votePost = (postId, tipo) =>
  api.post(`/posts/${postId}/voto`, { tipo });
