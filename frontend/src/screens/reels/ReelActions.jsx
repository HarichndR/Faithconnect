import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { reelService } from "../../services/reel.service";
import ReelCommentsSheet from "./ReelCommentsSheet";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

export default function ReelActions({ reel }) {
    const { user } = useContext(AuthContext);
    const { theme, isDark } = useContext(ThemeContext);
    const userId = user?._id;

    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likes, setLikes] = useState(0);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        setLiked(reel?.likes?.some(id => id === userId || id?._id === userId));
        setSaved(reel?.saves?.some(id => id === userId || id?._id === userId));
        setLikes(reel?.likes?.length || 0);
    }, [reel, userId]);

    const toggleLike = async () => {
        try {
            const wasLiked = liked;
            setLiked(!wasLiked); // Optimistic
            setLikes(prev => wasLiked ? prev - 1 : prev + 1);

            await reelService.like(reel._id);
        } catch (error) {
            setLiked(liked);
            setLikes(likes);
        }
    };

    const toggleSave = async () => {
        try {
            setSaved(!saved); // Optimistic
            await reelService.save(reel._id);
        } catch (error) {
            setSaved(saved);
        }
    };

    return (
        <View style={styles.actions}>
            <Action
                icon={liked ? "heart" : "heart-outline"}
                label={likes}
                onPress={toggleLike}
                color={liked ? "#EF4444" : "#fff"}
            />
            <Action
                icon="chatbubble-outline"
                label="Comment"
                onPress={() => setShowComments(true)}
            />
            <Action
                icon={saved ? "bookmark" : "bookmark-outline"}
                label="Save"
                onPress={toggleSave}
                color={saved ? (isDark ? theme.colors.accent : theme.colors.primary) : "#fff"}
            />

            <Modal
                visible={showComments}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowComments(false)}
                statusBarTranslucent
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <TouchableOpacity
                        style={styles.modalDismissArea}
                        onPress={() => setShowComments(false)}
                        activeOpacity={1}
                    />
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                            <View style={{ width: 24 }} />
                            <View style={[styles.dragHandle, { backgroundColor: theme.colors.border }]} />
                            <TouchableOpacity onPress={() => setShowComments(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ReelCommentsSheet reelId={reel._id} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function Action({ icon, label, onPress, color = "#fff" }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.action}>
            <Ionicons name={icon} size={30} color={color} style={styles.shadow} />
            <Text style={[styles.label, styles.shadow]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    actions: { alignItems: "center", gap: 22 },
    action: { alignItems: "center" },
    label: { color: "#fff", fontSize: 13, marginTop: 4, fontWeight: '700' },
    shadow: {
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalDismissArea: {
        flex: 1,
    },
    modalContent: {
        height: "75%",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    dragHandle: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
    },
    closeBtn: {
        padding: 4,
    }
});
