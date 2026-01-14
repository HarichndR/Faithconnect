import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    StatusBar,
} from "react-native";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { api, uploadApi } from "../../services/api.service";
import { logger } from "../../services/log.service";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreatePostScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const { theme, isDark } = useContext(ThemeContext);
    const insets = useSafeAreaInsets();

    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [mediaUri, setMediaUri] = useState(null);
    const [mediaType, setMediaType] = useState(null); // "image" | "video"
    const [loading, setLoading] = useState(false);

    /* ---------------- MEDIA PICKER ---------------- */

    const pickMedia = async (type) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes:
                    type === "image"
                        ? ImagePicker.MediaTypeOptions.Images
                        : ImagePicker.MediaTypeOptions.Videos,
                quality: 0.8,
                allowsEditing: type === "image",
                aspect: [4, 3],
            });

            if (!result.canceled) {
                setMediaUri(result.assets[0].uri);
                setMediaType(type);
            }
        } catch (err) {
            logger.error("Media picker error", err);
            Alert.alert("Error", "Failed to pick media");
        }
    };

    /* ---------------- CREATE POST ---------------- */

    const handleCreatePost = async () => {
        if (!title.trim() && !text.trim() && !mediaUri) {
            Alert.alert("Error", "Please add a title, text, or select media before posting.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();

            formData.append("title", title);
            formData.append("text", text);

            if (mediaUri && mediaType) {
                formData.append("mediaType", mediaType.toUpperCase());

                const filename = mediaUri.split("/").pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `${mediaType}/${match[1]}` : mediaType === "image" ? "image/jpeg" : "video/mp4";

                formData.append("media", {
                    uri: Platform.OS === "ios" ? mediaUri.replace("file://", "") : mediaUri,
                    name: filename || `upload.${mediaType === "image" ? "jpg" : "mp4"}`,
                    type: type,
                });
            }

            await uploadApi.post("/posts", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Accept": "application/json",
                },
            });

            Alert.alert("Success", "Your post has been shared!");
            navigation.goBack();
        } catch (err) {
            console.error("Create post failed", err);
            Alert.alert("Error", "Failed to create post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- UI ---------------- */

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            <StatusBar barStyle={theme.barStyle} />
            <View style={[styles.header, {
                backgroundColor: theme.colors.background,
                borderBottomColor: theme.colors.border,
                paddingTop: Math.max(insets.top, 50)
            }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.closeButton}
                >
                    <Ionicons name="close" size={28} color={theme.colors.text} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Create Post</Text>

                <TouchableOpacity
                    onPress={handleCreatePost}
                    disabled={loading}
                    style={[
                        styles.postButton,
                        { backgroundColor: theme.colors.primary },
                        (!title && !text && !mediaUri) && styles.postButtonDisabled
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color={isDark ? "#000" : "#fff"} size="small" />
                    ) : (
                        <Text style={[styles.postButtonText, { color: isDark ? "#000" : "#fff" }]}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* USER INFO */}
                <View style={styles.userRow}>
                    {user?.profilePhoto ? (
                        <Image source={{ uri: user.profilePhoto }} style={[styles.avatar, { borderColor: theme.colors.border }]} />
                    ) : (
                        <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
                            <Ionicons name="person" size={24} color={isDark ? "#000" : "#fff"} />
                        </View>
                    )}

                    <View>
                        <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.name}</Text>
                        <Text style={[styles.userFaith, { color: theme.colors.textSecondary }]}>{user?.faith}</Text>
                    </View>
                </View>

                {/* INPUTS */}
                <TextInput
                    placeholder="Title (optional)"
                    value={title}
                    onChangeText={setTitle}
                    style={[styles.titleInput, { color: theme.colors.text }]}
                    placeholderTextColor={theme.colors.textSecondary}
                    maxLength={100}
                />

                <TextInput
                    placeholder="What do you want to share with your flock?"
                    value={text}
                    onChangeText={setText}
                    multiline
                    style={[styles.textInput, { color: theme.colors.text }]}
                    placeholderTextColor={theme.colors.textSecondary}
                    textAlignVertical="top"
                />

                {/* MEDIA PREVIEW */}
                {mediaUri && (
                    <View style={[styles.mediaPreviewContainer, { backgroundColor: theme.colors.border }]}>
                        {mediaType === "image" ? (
                            <Image source={{ uri: mediaUri }} style={styles.mediaPreview} resizeMode="contain" />
                        ) : (
                            <Video
                                source={{ uri: mediaUri }}
                                style={styles.mediaPreview}
                                resizeMode="contain"
                                useNativeControls={false}
                                shouldPlay={false}
                            />
                        )}
                        <TouchableOpacity
                            style={styles.removeMediaButton}
                            onPress={() => {
                                setMediaUri(null);
                                setMediaType(null);
                            }}
                        >
                            <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* TOOLBAR */}
            <View style={[styles.toolbar, {
                backgroundColor: theme.colors.card,
                borderTopColor: theme.colors.border,
                paddingBottom: Math.max(insets.bottom, 12)
            }]}>
                <Text style={[styles.toolbarLabel, { color: theme.colors.textSecondary }]}>Add to your post</Text>
                <View style={styles.toolbarActions}>
                    <TouchableOpacity
                        style={styles.toolbarButton}
                        onPress={() => pickMedia("image")}
                    >
                        <Ionicons name="image" size={26} color="#10B981" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.toolbarButton}
                        onPress={() => pickMedia("video")}
                    >
                        <Ionicons name="videocam" size={26} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: "800" },
    closeButton: { padding: 4 },
    postButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 70,
        alignItems: "center",
        justifyContent: "center",
    },
    postButtonDisabled: { opacity: 0.5 },
    postButtonText: { fontSize: 14, fontWeight: "800" },
    scrollContent: { paddingBottom: 150 },
    userRow: { flexDirection: "row", alignItems: "center", padding: 16 },
    avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, borderWidth: 1 },
    avatarFallback: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginRight: 12 },
    userName: { fontSize: 16, fontWeight: "800" },
    userFaith: { fontSize: 13, fontWeight: "500" },
    titleInput: { paddingHorizontal: 16, paddingVertical: 12, fontSize: 18, fontWeight: "800" },
    textInput: { paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, minHeight: 150 },
    mediaPreviewContainer: { margin: 16, borderRadius: 12, overflow: "hidden", position: "relative" },
    mediaPreview: { width: "100%", height: 300, backgroundColor: "#000" },
    removeMediaButton: { position: "absolute", top: 12, right: 12, backgroundColor: "rgba(0,0,0,0.6)", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    toolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
    toolbarLabel: { fontSize: 15, fontWeight: "700" },
    toolbarActions: { flexDirection: "row", gap: 16 },
    toolbarButton: { padding: 4 },
});
