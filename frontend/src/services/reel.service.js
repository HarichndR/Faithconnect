
import { api, uploadApi } from "./api.service";

export const reelService = {
    create: (formData, onProgress) =>
        uploadApi.post("/reels", formData, {
            onUploadProgress: (e) => {
                if (!e.total) return;
                const percent = Math.round((e.loaded * 100) / e.total);
                onProgress?.(percent);
            },
        }),

    explore: (params) => api.get("/reels/explore", { params }),
    following: (params) => api.get("/reels/following", { params }),
    getByUser: (userId) => api.get(`/reels/user/${userId}`),
    getSaved: () => api.get("/reels/saved"),
    getLiked: () => api.get("/reels/liked"),
    like: (reelId) => api.post(`/reels/${reelId}/like`),
    save: (reelId) => api.post(`/reels/${reelId}/save`),
    comments: (reelId) => api.get(`/reels/${reelId}/comments`),
    comment: (data) => api.post("/reels/comment", data),
};
