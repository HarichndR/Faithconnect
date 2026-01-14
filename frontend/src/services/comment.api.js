import api from "./api.service";

export const createComment = (payload) =>
    api.put("/posts/comment", payload);

export const getComments = (postId) =>
    api.get(`/posts/comments/${postId}`);
