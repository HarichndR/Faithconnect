import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Video } from "expo-av";
import { useRef, useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { uploadApi } from "../../services/api.service";
import { ThemeContext } from "../../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ================= CONFIG ================= */
const MAX_DURATION_SEC = 60;
const PREVIEW_HEIGHT = 480;

export default function CreateReelScreen({ navigation }) {
    const { theme, isDark } = useContext(ThemeContext);
    const insets = useSafeAreaInsets();
    const videoRef = useRef(null);

    const [caption, setCaption] = useState("");
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);

    /* ================= FIX ANDROID content:// URI ================= */
    const normalizeUri = async (uri) => {
        if (Platform.OS === "android" && uri.startsWith("content://")) {
            const dest = FileSystem.cacheDirectory + "reel.mp4";
            await FileSystem.copyAsync({ from: uri, to: dest });
            return dest;
        }
        return uri;
    };

    /* ================= PICK VIDEO ================= */
    const pickVideo = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert("Permission required", "Please allow media access to select videos");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 0.8,
                videoMaxDuration: MAX_DURATION_SEC,
            });

            if (result.canceled || !result.assets?.length) return;

            const asset = result.assets[0];

            if (asset.duration && asset.duration / 1000 > MAX_DURATION_SEC + 5) {
                Alert.alert(
                    "Video too long",
                    `Reels must be under ${MAX_DURATION_SEC} seconds. Please trim your video.`
                );
                return;
            }

            asset.uri = await normalizeUri(asset.uri);

            setVideo(asset);
            setIsPlaying(true);
            setIsMuted(false);
            setProgress(0);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to select video");
        }
    };

    /* ================= PLAY / PAUSE ================= */
    const togglePlay = async () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            await videoRef.current.pauseAsync();
        } else {
            await videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    /* ================= AUDIO ================= */
    const toggleMute = () => setIsMuted(!isMuted);

    /* ================= SUBMIT ================= */
    const submit = async () => {
        if (!video) return;

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("caption", caption.trim());

            const filename = video.uri.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `video/${match[1]}` : "video/mp4";

            formData.append("reel", {
                uri: Platform.OS === "ios" ? video.uri.replace("file://", "") : video.uri,
                name: filename || "reel.mp4",
                type: type,
            });

            await uploadApi.post("/reels", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Accept": "application/json",
                },
            });

            Alert.alert("Success", "Reel uploaded successfully! 🎉");
            navigation.goBack();
        } catch (err) {
            console.error("UPLOAD ERROR:", err);
            Alert.alert("Error", "Failed to upload reel. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>New Reel</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {!video ? (
                    <TouchableOpacity
                        style={[styles.uploadPlaceholder, {
                            backgroundColor: isDark ? '#121212' : '#FAFBFC',
                            borderColor: theme.colors.border
                        }]}
                        onPress={pickVideo}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.uploadIconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="cloud-upload-outline" size={40} color={theme.colors.primary} />
                        </View>
                        <Text style={[styles.uploadTitle, { color: theme.colors.text }]}>Select Video</Text>
                        <Text style={[styles.uploadSubtitle, { color: theme.colors.textSecondary }]}>
                            Share your moments with your community (max 60s)
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.videoContainer}>
                        <View style={styles.previewWrapper}>
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={togglePlay}
                                style={StyleSheet.absoluteFill}
                            >
                                <Video
                                    ref={videoRef}
                                    source={{ uri: video.uri }}
                                    style={styles.preview}
                                    resizeMode="cover"
                                    shouldPlay={isPlaying}
                                    isLooping
                                    isMuted={isMuted}
                                />
                            </TouchableOpacity>

                            {!isPlaying && (
                                <View style={styles.playOverlay}>
                                    <Ionicons name="play" size={50} color="#fff" />
                                </View>
                            )}

                            <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
                                <Ionicons
                                    name={isMuted ? "volume-mute" : "volume-high"}
                                    size={20}
                                    color="#fff"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.changeVideoButton}
                                onPress={pickVideo}
                            >
                                <Ionicons name="swap-horizontal" size={20} color="#fff" />
                                <Text style={styles.changeVideoText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.formContainer}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Caption</Text>
                    <TextInput
                        placeholder="Write a captivating caption..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={caption}
                        onChangeText={setCaption}
                        style={[styles.input, {
                            backgroundColor: isDark ? '#1a1a1a' : '#FAFBFC',
                            borderColor: theme.colors.border,
                            color: theme.colors.text
                        }]}
                        editable={!loading}
                        multiline
                        maxLength={200}
                    />
                    <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>{caption.length}/200</Text>
                </View>

            </ScrollView>

            <View style={[styles.footer, {
                backgroundColor: theme.colors.background,
                borderTopColor: theme.colors.border,
                paddingBottom: Math.max(insets.bottom, 20)
            }]}>
                <TouchableOpacity
                    style={[
                        styles.submitBtn,
                        { backgroundColor: theme.colors.primary },
                        (!video || loading) && styles.submitBtnDisabled
                    ]}
                    onPress={submit}
                    disabled={!video || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={isDark ? "#000" : "#fff"} />
                    ) : (
                        <Text style={[styles.submitText, { color: isDark ? "#000" : "#fff" }]}>Share Reel</Text>
                    )}
                </TouchableOpacity>
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
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: "800" },
    closeButton: { padding: 4 },
    scrollContent: { paddingBottom: 150 },
    uploadPlaceholder: {
        height: 300,
        margin: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    uploadIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 8 },
    uploadTitle: { fontSize: 18, fontWeight: "800" },
    uploadSubtitle: { fontSize: 13, textAlign: "center", maxWidth: 200 },
    videoContainer: { padding: 20 },
    previewWrapper: { width: "100%", height: PREVIEW_HEIGHT, borderRadius: 20, overflow: "hidden", backgroundColor: "#000", position: "relative" },
    preview: { width: "100%", height: "100%" },
    playOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.2)" },
    muteButton: { position: "absolute", bottom: 16, right: 16, backgroundColor: "rgba(0,0,0,0.6)", padding: 8, borderRadius: 20 },
    changeVideoButton: { position: "absolute", top: 16, right: 16, backgroundColor: "rgba(0,0,0,0.6)", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 6 },
    changeVideoText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    formContainer: { paddingHorizontal: 20 },
    label: { fontSize: 15, fontWeight: "800", marginBottom: 12, marginLeft: 4 },
    input: { borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 15, minHeight: 120, textAlignVertical: "top" },
    charCount: { textAlign: "right", fontSize: 12, marginTop: 6 },
    footer: { padding: 20, borderTopWidth: 1 },
    submitBtn: { paddingVertical: 16, borderRadius: 16, alignItems: "center", elevation: 4 },
    submitBtnDisabled: { backgroundColor: "#E5E7EB", elevation: 0, opacity: 0.5 },
    submitText: { fontSize: 16, fontWeight: "800" },
});
