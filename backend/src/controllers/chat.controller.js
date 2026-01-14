const Chat = require("../models/chat.model");
const Message = require("../models/message.model");

/* =====================================================
   GET ALL CHATS (ChatListScreen)
===================================================== */
exports.getChats = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const chats = await Chat.find({
            participants: userId,
        })
            .populate("participants", "name profilePhoto")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        const formatted = chats.map((chat) => {
            const unread = chat.unreadCount?.get(userId.toString()) || 0;

            return {
                ...chat.toObject(),
                unreadCount: unread,
            };
        });

        res.status(200).json({
            status: "success",
            data: formatted,
        });
    } catch (err) {
        next(err);
    }
};

/* =====================================================
   GET MESSAGES OF A CHAT
===================================================== */
exports.getMessages = async (req, res, next) => {
    try {
        const { chatId } = req.params;

        const messages = await Message.find({ chat: chatId })
            .populate("sender", "name profilePhoto")
            .sort({ createdAt: 1 });

        res.status(200).json({
            status: "success",
            data: messages,
        });
    } catch (err) {
        next(err);
    }
};

/* =====================================================
   SEND MESSAGE
===================================================== */
exports.sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.userId;
        const { chatId, content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Message content required" });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const message = await Message.create({
            chat: chatId,
            sender: senderId,
            content,
            seenBy: [senderId],
        });

        /* 🔔 Update unread counts */
        chat.participants.forEach((p) => {
            const id = p.toString();
            if (id !== senderId.toString()) {
                chat.unreadCount.set(
                    id,
                    (chat.unreadCount.get(id) || 0) + 1
                );
            }
        });

        chat.lastMessage = message._id;
        await chat.save();

        const populated = await message.populate(
            "sender",
            "name profilePhoto"
        );

        // 🔔 Notify recipient
        const { sendNotification } = require("../utils/sendNotification.util");
        const recipientId = chat.participants.find(p => p.toString() !== senderId.toString());
        if (recipientId) {
            sendNotification({
                recipient: recipientId,
                sender: senderId,
                type: "MESSAGE",
                title: populated.sender.name,
                message: content.length > 50 ? content.substring(0, 47) + "..." : content,
                data: { chatId: chat._id, type: "CHAT" }
            });
        }

        res.status(201).json({
            status: "success",
            data: populated,
        });
    } catch (err) {
        next(err);
    }
};

/* =====================================================
   MARK CHAT AS READ
===================================================== */
exports.markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { chatId } = req.params;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        chat.unreadCount.set(userId.toString(), 0);
        await chat.save();

        await Message.updateMany(
            { chat: chatId, seenBy: { $ne: userId } },
            { $addToSet: { seenBy: userId } }
        );

        res.status(200).json({ status: "success" });
    } catch (err) {
        next(err);
    }
};

/* =====================================================
   CREATE OR GET CHAT (START CHAT)
===================================================== */
exports.getOrCreateChat = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { otherUserId } = req.body;

        let chat = await Chat.findOne({
            participants: { $all: [userId, otherUserId] },
        }).populate("participants", "name profilePhoto");

        if (!chat) {
            chat = await Chat.create({
                participants: [userId, otherUserId],
            });

            chat = await chat.populate(
                "participants",
                "name profilePhoto"
            );
        }

        res.status(200).json({
            status: "success",
            data: chat,
        });
    } catch (err) {
        next(err);
    }
};
