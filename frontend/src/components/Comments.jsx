import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { createComment, getComments } from "../services/comment.api";

export default function Comments({ postId }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const res = await getComments(postId);
            setComments(res.data.data || []);
        } catch (err) {
            console.error("Fetch comments failed", err);
        }
    };

    const handleSubmit = async () => {
        if (!text.trim()) return;

        try {
            setLoading(true);

            const res = await createComment({
                postId: postId,
                comment: text,
            });

            setComments(res.data.data || []);
            setText("");
            // Refresh comments after posting
            fetchComments();
        } catch (err) {
            console.error("Create comment failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* COMMENTS LIST */}
            {comments.map((c, index) => (
                <View key={index} style={styles.commentRow}>
                    <Image
                        source={{ uri: c.userId?.profilePhoto }}
                        style={styles.avatar}
                    />
                    <View style={styles.commentBody}>
                        <Text style={styles.name}>{c.userId?.name}</Text>
                        <Text style={styles.commentText}>{c.comment}</Text>
                    </View>
                </View>
            ))}

            {/* INPUT */}
            <View style={styles.inputRow}>
                <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Add a comment..."
                    style={styles.input}
                />

                <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" />
                    ) : (
                        <Text style={styles.postBtn}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

/* ---------- STYLES ---------- */
const styles = {
    container: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingTop: 10,
    },
    commentRow: {
        flexDirection: "row",
        marginBottom: 10,
        alignItems: "flex-start",
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
        backgroundColor: "#ddd",
    },
    commentBody: {
        flex: 1,
    },
    name: {
        fontSize: 13,
        fontWeight: "600",
    },
    commentText: {
        fontSize: 13,
        color: "#333",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingTop: 8,
        marginTop: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "#f5f5f5",
        borderRadius: 20,
        marginRight: 8,
    },
    postBtn: {
        color: "#1DA1F2",
        fontWeight: "600",
        paddingHorizontal: 8,
    },
};
