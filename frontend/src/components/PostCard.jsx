import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Pressable,
    Share,
    Alert,
    StyleSheet,
} from "react-native";
import { useContext, useState } from "react";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { api } from "../services/api.service";
import { logger } from "../services/log.service";
import Comments from "./Comments";

export default function PostCard({ post, onPress, onPostUpdate }) {
    const { user } = useContext(AuthContext);
    const { theme, isDark } = useContext(ThemeContext);
    const navigation = useNavigation();
    const userId = user?._id;

    const isLiked = post.likes?.includes(userId);
    const isSaved = post.saves?.includes(userId);

    const [showComments, setShowComments] = useState(false);
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);

    /* ---------------- LIKE ---------------- */
    const handleLike = async () => {
        if (loadingLike) return;
        try {
            setLoadingLike(true);
            await api.post(`/posts/${post._id}/like`);

            onPostUpdate({
                ...post,
                likes: isLiked
                    ? post.likes.filter((id) => id !== userId)
                    : [...post.likes, userId],
            });
        } catch (err) {
            logger.error("Like failed", err);
            Alert.alert("Error", "Failed to like post");
        } finally {
            setLoadingLike(false);
        }
    };

    /* ---------------- SAVE ---------------- */
    const handleSave = async () => {
        if (loadingSave) return;
        try {
            setLoadingSave(true);
            await api.post(`/posts/${post._id}/save`);

            onPostUpdate({
                ...post,
                saves: isSaved
                    ? post.saves.filter((id) => id !== userId)
                    : [...post.saves, userId],
            });
        } catch (err) {
            logger.error("Save failed", err);
            Alert.alert("Error", "Failed to save post");
        } finally {
            setLoadingSave(false);
        }
    };

    /* ---------------- SHARE ---------------- */
    const handleShare = async () => {
        try {
            await Share.share({
                message: `${post.title || "FaithConnect Post"}\n\n${post.text || ""}\n\n— ${post.author?.name}`,
            });
        } catch {
            Alert.alert("Error", "Unable to share post");
        }
    };

    const navigateToProfile = () => {
        if (!post.author) return;
        navigation.navigate("LeaderProfile", { leaderId: post.author._id });
    };

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [{ opacity: pressed ? 0.98 : 1 }]}
        >
            <View style={[styles.card, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                {/* ---------- HEADER ---------- */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.authorRow}
                        onPress={navigateToProfile}
                        activeOpacity={0.7}
                    >
                        {post.author?.profilePhoto ? (
                            <Image source={{ uri: post.author.profilePhoto }} style={[styles.avatar, { borderColor: theme.colors.border }]} />
                        ) : (
                            <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border }]}>
                                <Ionicons name="person" size={20} color={isDark ? "#000" : "#fff"} />
                            </View>
                        )}
                        <View>
                            <Text style={[styles.authorName, { color: theme.colors.text }]}>{post.author?.name}</Text>
                            <Text style={[styles.authorMeta, { color: theme.colors.textSecondary }]}>{post.author?.faith}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* ---------- CONTENT ---------- */}
                {post.title && <Text style={[styles.title, { color: theme.colors.text }]}>{post.title}</Text>}
                {post.text && <Text style={[styles.text, { color: isDark ? '#E5E7EB' : '#374151' }]}>{post.text}</Text>}

                {post.mediaType === "IMAGE" && (
                    <Image source={{ uri: post.mediaUrl }} style={styles.media} />
                )}

                {post.mediaType === "VIDEO" && (
                    <Video
                        source={{ uri: post.mediaUrl }}
                        style={styles.media}
                        resizeMode="cover"
                        useNativeControls
                        isLooping
                    />
                )}

                {/* ---------- ACTIONS ---------- */}
                <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
                    <ActionBtn
                        icon={isLiked ? "heart" : "heart-outline"}
                        color={isLiked ? "#EF4444" : theme.colors.textSecondary}
                        text={post.likes.length}
                        onPress={handleLike}
                        active={isLiked}
                    />

                    <ActionBtn
                        icon="chatbubble-outline"
                        color={theme.colors.textSecondary}
                        text={post.comments?.length || "Comment"}
                        onPress={() => setShowComments((p) => !p)}
                        active={showComments}
                        theme={theme}
                    />

                    <ActionBtn
                        icon={isSaved ? "bookmark" : "bookmark-outline"}
                        color={isSaved ? theme.colors.primary : theme.colors.textSecondary}
                        text={isSaved ? "Saved" : "Save"}
                        onPress={handleSave}
                        active={isSaved}
                        theme={theme}
                    />

                    <ActionBtn
                        icon="share-social-outline"
                        color={theme.colors.textSecondary}
                        text="Share"
                        onPress={handleShare}
                    />
                </View>

                {/* ---------- COMMENTS ---------- */}
                {showComments && <Comments postId={post._id} />}
            </View>
        </Pressable>
    );
}

/* ---------- ACTION BUTTON ---------- */
function ActionBtn({ icon, text, color, onPress, active, theme }) {
    return (
        <TouchableOpacity
            onPress={(e) => {
                e.stopPropagation();
                onPress();
            }}
            style={[styles.actionBtn, active && { backgroundColor: theme?.colors?.border || (active ? 'rgba(0,0,0,0.05)' : 'transparent') }]}
            activeOpacity={0.7}
        >
            <Ionicons name={icon} size={20} color={color} />
            <Text style={[styles.actionText, { color }]}>{text}</Text>
        </TouchableOpacity>
    );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderBottomWidth: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    authorRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 10,
        borderWidth: 1.5,
    },
    avatarFallback: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        borderWidth: 1.5,
    },
    authorName: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 2,
    },
    authorMeta: {
        fontSize: 12,
        fontWeight: "600",
    },
    menuButton: {
        padding: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: "800",
        marginBottom: 8,
        lineHeight: 24,
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    media: {
        width: "100%",
        height: 300,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: "#000",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 8,
        borderTopWidth: 1,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    actionText: {
        fontSize: 13,
        fontWeight: "700",
    },
});
