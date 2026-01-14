import React, { useEffect, useState, useContext, useCallback, useMemo, memo } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image
} from "react-native";
import { reelService } from "../../services/reel.service";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

// 1. Separate Input Component to prevent re-rendering the whole list on every keystroke
const CommentInput = memo(({ onSend, sending, theme, isDark }) => {
    const [text, setText] = useState("");

    const handleSend = () => {
        if (!text.trim() || sending) return;
        onSend(text.trim());
        setText("");
    };

    return (
        <View style={[styles.inputContainer, {
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.background,
            paddingBottom: Platform.OS === 'ios' ? 25 : 12
        }]}>
            <TextInput
                value={text}
                onChangeText={setText}
                style={[styles.input, {
                    backgroundColor: isDark ? '#1a1a1a' : '#F9FAFB',
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                }]}
                placeholder="Add a comment..."
                placeholderTextColor={theme.colors.textSecondary}
            />
            <TouchableOpacity onPress={handleSend} disabled={!text.trim() || sending}>
                {sending ? (
                    <ActivityIndicator color={theme.colors.primary} />
                ) : (
                    <Ionicons
                        name="arrow-up-circle"
                        size={36}
                        color={text.trim() ? theme.colors.primary : theme.colors.border}
                    />
                )}
            </TouchableOpacity>
        </View>
    );
});

// 2. Memoized Comment Item
const CommentItem = memo(({ item, theme, isDark }) => (
    <View style={styles.commentItem}>
        {item.userId?.profilePhoto ? (
            <Image source={{ uri: item.userId.profilePhoto }} style={styles.avatar} />
        ) : (
            <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="person" size={14} color={isDark ? "#000" : "#fff"} />
            </View>
        )}
        <View style={styles.commentContent}>
            <Text style={[styles.author, { color: theme.colors.text }]}>
                {item.userId?.name || "User"}
            </Text>
            <Text style={[styles.text, { color: isDark ? '#E5E7EB' : '#374151' }]}>
                {item.comment}
            </Text>
        </View>
    </View>
));

export default function ReelCommentsSheet({ reelId }) {
    const { theme, isDark } = useContext(ThemeContext);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        load();
    }, [reelId]);

    const load = async () => {
        try {
            const res = await reelService.comments(reelId);
            setComments(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendComment = useCallback(async (content) => {
        setSending(true);
        try {
            await reelService.comment({ reelId, comment: content });
            await load(); // Refresh list
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    }, [reelId]);

    const renderItem = useCallback(({ item }) => (
        <CommentItem item={item} theme={theme} isDark={isDark} />
    ), [theme, isDark]);

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Comments</Text>
            </View>

            <FlatList
                data={comments}
                keyExtractor={(item, index) => item._id || index.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                        No comments yet. Be the first!
                    </Text>
                }
            />

            <CommentInput
                onSend={handleSendComment}
                sending={sending}
                theme={theme}
                isDark={isDark}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
    headerTitle: { fontWeight: "800", fontSize: 16 },
    listContent: { padding: 16, paddingBottom: 40 },
    commentItem: { flexDirection: "row", marginBottom: 20 },
    avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
    avatarFallback: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: 12 },
    commentContent: { flex: 1 },
    author: { fontWeight: "700", fontSize: 13, marginBottom: 2 },
    text: { fontSize: 14, lineHeight: 18 },
    emptyText: { textAlign: "center", marginTop: 40, fontSize: 15 },
    inputContainer: { flexDirection: "row", alignItems: "center", padding: 12, borderTopWidth: 1 },
    input: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, marginRight: 12, fontSize: 15, borderWidth: 1 },
});
