import { api } from "./api.service";

export const chatService = {
    // Get all active conversations
    getChats: () => api.get("/chats"),

    // Get messages for a specific chat
    getMessages: (chatId) => api.get(`/chats/${chatId}/messages`),

    // Send a message
    sendMessage: (chatId, content) => api.post("/chats/message", { chatId, content }),

    // Mark chat as read
    markAsRead: (chatId) => api.put(`/chats/${chatId}/read`),

    // Start a new chat or get existing one by user ID
    createOrGetChat: (otherUserId) => api.post("/chats/start", { otherUserId }),
};
