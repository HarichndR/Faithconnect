import { api, uploadApi } from "./api.service";

export const postService = {
    create: (formData) => uploadApi.post("/posts", formData),
    explore: (params) => api.get("/posts/explore", { params }),
    following: (params) => api.get("/posts/following", { params }),
    getByUser: (userId) => api.get(`/posts/user/${userId}`),
    getSaved: () => api.get("/posts/saved"),
    getLiked: () => api.get("/posts/liked"),
    like: (postId) => api.post(`/posts/${postId}/like`),
    save: (postId) => api.post(`/posts/${postId}/save`),

    // Comments
    comment: (data) => api.put("/posts/comment", data),
    comments: (postId) => api.get(`/posts/comments/${postId}`),

    // Details
    getById: (postId) => api.get(`/posts/${postId}`),
};