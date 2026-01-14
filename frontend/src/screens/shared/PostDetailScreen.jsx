import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Image,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api.service";
import PostCard from "../../components/PostCard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { logger } from "../../services/log.service";
// import Comments from "../../components/Comments";

export default function PostDetailScreen({ route, navigation }) {
    const { postId } = route.params;
    const { user } = useContext(AuthContext);
    const userId = user?._id;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    /* ---------------- FETCH POST ---------------- */
    useEffect(() => {
        fetchPost();
    }, [postId]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/posts/${postId}`);
            const postData = res.data.data;

            setPost(postData);

            setIsLiked(
                Array.isArray(postData.likes) && userId
                    ? postData.likes.includes(userId)
                    : false
            );

            setIsSaved(
                Array.isArray(postData.saves) && userId
                    ? postData.saves.includes(userId)
                    : false
            );
        } catch (err) {
            logger.error("Fetch post failed", err);
            setError("Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- LIKE TOGGLE ---------------- */
    const handleLike = async () => {
        try {
            await api.post(`/posts/${postId}/like`);

            setIsLiked((prev) => !prev);
            setPost((prev) => ({
                ...prev,
                likes: isLiked
                    ? prev.likes.filter((id) => id !== userId)
                    : [...prev.likes, userId],
            }));
        } catch (err) {
            logger.error("Like failed", err);
        }
    };

    /* ---------------- SAVE TOGGLE (FIXED) ---------------- */
    const handleSave = async () => {
        try {
            await api.post(`/posts/${postId}/save`);

            setIsSaved((prev) => !prev);
            setPost((prev) => ({
                ...prev,
                saves: isSaved
                    ? prev.saves.filter((id) => id !== userId)
                    : [...prev.saves, userId],
            }));
        } catch (err) {
            logger.error("Save failed", err);
        }
    };

    /* ---------------- STATES ---------------- */
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1DA1F2" />
            </View>
        );
    }

    if (error || !post) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error || "Post not found"}</Text>
            </View>
        );
    }

    /* ---------------- UI ---------------- */
    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#1DA1F2" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* POST */}
                <PostCard post={post} onPress={() => { }} />

                {/* LIKE & SAVE (ABOVE COMMENTS) */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        onPress={handleLike}
                        style={[
                            styles.actionBtn,
                            isLiked && { backgroundColor: "#ffebee" },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={20}
                            color={isLiked ? "#E0245E" : "#657786"}
                        />
                        <Text
                            style={[
                                styles.actionText,
                                isLiked && { color: "#E0245E" },
                            ]}
                        >
                            Like ({post.likes.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSave}
                        style={[
                            styles.actionBtn,
                            isSaved && { backgroundColor: "#e3f2fd" },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={isSaved ? "bookmark" : "bookmark-outline"}
                            size={20}
                            color={isSaved ? "#1DA1F2" : "#657786"}
                        />
                        <Text
                            style={[
                                styles.actionText,
                                isSaved && { color: "#1DA1F2" },
                            ]}
                        >
                            {isSaved ? "Saved" : "Save"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* COMMENTS (below actions) */}
                {/* <Comments postId={postId} /> */}

                {/* AUTHOR */}
                <View style={styles.authorBox}>
                    <Text style={styles.postedBy}>Posted by</Text>
                    <View style={styles.authorRow}>
                        {post.author.profilePhoto ? (
                            <Image source={{ uri: post.author.profilePhoto }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Ionicons name="person" size={18} color="#fff" />
                            </View>
                        )}
                        <View>
                            <Text style={styles.authorName}>{post.author.name}</Text>
                            <Text style={styles.authorFaith}>{post.author.faith}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

/* ---------------- STYLES ---------------- */
const styles = {
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontSize: 16,
        fontWeight: "600",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
        borderColor: "#e1e8ed",
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "700",
    },
    actionRow: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    actionText: {
        fontWeight: "600",
    },
    authorBox: {
        borderTopWidth: 1,
        borderColor: "#e1e8ed",
        padding: 16,
    },
    postedBy: {
        fontSize: 12,
        fontWeight: "600",
        color: "#657786",
        marginBottom: 8,
    },
    authorRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatarFallback: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1DA1F2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    authorName: {
        fontSize: 14,
        fontWeight: "700",
    },
    authorFaith: {
        fontSize: 12,
        color: "#657786",
    },
};
