import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StyleSheet,
    Image,
    StatusBar,
} from "react-native";
import { useEffect, useRef, useState, useContext } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../services/api.service";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { getSocket, initSocket } from "../../services/socket.service";

export default function ChatScreen({ route, navigation }) {
    const { chatId: initialChatId, otherUser } = route.params || {};
    const { user } = useContext(AuthContext);
    const { theme, isDark } = useContext(ThemeContext);
    const insets = useSafeAreaInsets();

    const [chatId, setChatId] = useState(initialChatId || null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const socket = getSocket() || initSocket(user?._id);

    const flatListRef = useRef(null);

    /* ================= HEADER ================= */
    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [otherUser]);

    /* ================= INIT CHAT & SOCKET ================= */
    useEffect(() => {
        initChat();

        const handleNewMessage = (newMessage) => {
            if (newMessage.chat === chatId && newMessage.sender !== user._id) {
                setMessages((prev) => [...prev, newMessage]);
                scrollToBottom();
            }
        };

        socket?.on("newMessage", handleNewMessage);

        return () => {
            socket?.off("newMessage", handleNewMessage);
        };
    }, [chatId]);

    const initChat = async () => {
        try {
            let id = initialChatId;

            if (!id && otherUser) {
                const res = await api.post("/chats/start", {
                    otherUserId: otherUser._id,
                });
                id = res.data.data._id;
            }

            if (id) {
                setChatId(id);
                const msgRes = await api.get(`/chats/${id}/messages`);
                setMessages(msgRes.data.data || []);
                await api.post(`/chats/read/${id}`);
                scrollToBottom();
            }
        } catch (err) {
            console.log("INIT CHAT ERROR:", err?.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    /* ================= SEND MESSAGE ================= */
    const sendMessage = async () => {
        if (!text.trim() || sending || !chatId) return;

        const content = text.trim();
        setText("");

        try {
            setSending(true);

            const optimisticMsg = {
                _id: Date.now().toString(),
                chat: chatId,
                sender: { _id: user._id },
                content: content,
                createdAt: new Date().toISOString(),
                pending: true,
            };
            setMessages((prev) => [...prev, optimisticMsg]);
            scrollToBottom();

            const res = await api.post("/chats/message", {
                chatId,
                content,
            });

            setMessages((prev) =>
                prev.map((msg) => (msg._id === optimisticMsg._id ? res.data.data : msg))
            );

            socket.emit("sendMessage", res.data.data);

        } catch (err) {
            console.log("SEND ERROR:", err?.response?.data || err.message);
        } finally {
            setSending(false);
        }
    };

    /* ================= MESSAGE BUBBLE ================= */
    const MessageItem = ({ item }) => {
        const senderId = item.sender?._id || item.sender;
        const isMe = senderId === user._id;

        return (
            <View
                style={[
                    styles.messageBubble,
                    isMe ? [styles.myBubble, { backgroundColor: theme.colors.primary }] : [styles.otherBubble, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
                    item.pending && styles.pendingBubble,
                ]}
            >
                <Text style={[styles.bubbleText, { color: isMe ? (isDark ? '#000' : '#fff') : theme.colors.text }]}>
                    {item.content}
                </Text>

                <Text style={[styles.time, isMe ? { color: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)' } : { color: theme.colors.textSecondary }]}>
                    {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar barStyle={theme.barStyle} />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                {/* CUSTOM HEADER */}
                <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                        <View style={styles.avatarContainer}>
                            {otherUser?.profilePhoto ? (
                                <Image source={{ uri: otherUser.profilePhoto }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
                                    <Ionicons name="person" size={16} color={isDark ? "#000" : "#fff"} />
                                </View>
                            )}
                            <View style={[styles.onlineDot, { borderColor: theme.colors.background }]} />
                        </View>
                        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{otherUser?.name || "Chat"}</Text>
                    </View>

                    <TouchableOpacity style={styles.optionButton}>
                        <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                {/* MESSAGES */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => <MessageItem item={item} />}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={scrollToBottom}
                    onLayout={scrollToBottom}
                    showsVerticalScrollIndicator={false}
                />

                {/* INPUT */}
                <View style={[styles.inputWrapper, {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
                }]}>
                    <TextInput
                        value={text}
                        onChangeText={setText}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.colors.textSecondary}
                        style={[styles.input, {
                            backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
                            color: theme.colors.text,
                            borderColor: theme.colors.border
                        }]}
                        multiline
                    />

                    <TouchableOpacity
                        onPress={sendMessage}
                        disabled={!chatId || sending || !text.trim()}
                        style={[
                            styles.sendBtn,
                            { backgroundColor: theme.colors.primary },
                            (!chatId || !text.trim()) && [styles.sendBtnDisabled, { backgroundColor: theme.colors.border }],
                        ]}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color={isDark ? "#000" : "#fff"} />
                        ) : (
                            <Ionicons name="send" size={18} color={isDark ? "#000" : "#fff"} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: { marginRight: 12, padding: 4 },
    headerInfo: { flex: 1, flexDirection: "row", alignItems: "center" },
    avatarContainer: { position: 'relative', marginRight: 10 },
    avatar: { width: 36, height: 36, borderRadius: 18 },
    avatarFallback: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
    onlineDot: {
        position: 'absolute', bottom: 0, right: 0, width: 10, height: 10,
        borderRadius: 5, backgroundColor: "#10B981", borderWidth: 1.5,
    },
    headerTitle: { fontSize: 16, fontWeight: "800" },
    optionButton: { padding: 4 },
    listContent: { padding: 16, paddingBottom: 20 },
    messageBubble: { maxWidth: "80%", padding: 12, borderRadius: 18, marginVertical: 4 },
    myBubble: { alignSelf: "flex-end", borderTopRightRadius: 4 },
    otherBubble: { alignSelf: "flex-start", borderTopLeftRadius: 4, borderWidth: 1 },
    pendingBubble: { opacity: 0.7 },
    bubbleText: { fontSize: 15, fontWeight: '500' },
    time: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1
    },
    input: {
        flex: 1, borderRadius: 24, paddingHorizontal: 20,
        paddingVertical: Platform.OS === "ios" ? 12 : 8,
        fontSize: 15, maxHeight: 100, borderWidth: 1,
    },
    sendBtn: {
        marginLeft: 12, width: 44, height: 44, borderRadius: 22,
        justifyContent: "center", alignItems: "center",
        elevation: 2,
    },
    sendBtnDisabled: { elevation: 0 },
});
