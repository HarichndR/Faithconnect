import { api } from "./api.service";

export const conferenceService = {
    getAll: () => api.get("/conferences"),
    getById: (roomId) => api.get(`/conferences/${roomId}`),
    create: (data) => api.post("/conferences", data),
    updateStatus: (roomId, status) => api.patch(`/conferences/${roomId}/status`, { status }),
};
