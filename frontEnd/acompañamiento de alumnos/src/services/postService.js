import { api } from "./api";

export const getPosts = () => api.get("/posts");

export const createPost = (contenido) => api.post("/posts", { contenido });
