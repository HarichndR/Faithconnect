import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useContext, useState, memo } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import api from "../../services/api.service";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { FAITH_OPTIONS } from "../../constants/index";
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = ({ route, navigation }) => {
    const { role } = route.params || { role: "worshiper" };
    const { setSession } = useContext(AuthContext);
    const { theme, isDark } = useContext(ThemeContext);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        faith: "",
        bio: "",
    });
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Sorry, we need camera roll permissions to make this work!");
            return;
        }

        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!res.canceled) setPhoto(res.assets[0]);
    };

    const submit = async () => {
        if (loading) return;
        setError("");

        if (!form.name || !form.email || !form.password || !form.faith) {
            setError("All fields (except bio) are required");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(form).forEach(([k, v]) => data.append(k, v.trim()));
            data.append("role", role);

            if (photo) {
                const uri = Platform.OS === "ios" ? photo.uri.replace("file://", "") : photo.uri;
                const filename = uri.split("/").pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                data.append("profilePhoto", {
                    uri: uri,
                    name: filename || "profile.jpg",
                    type: type,
                });
            }

            const res = await api.post("/auth/register", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            await setSession(res.data.data);
            navigation.replace("ProfileSetup");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar barStyle={theme.barStyle} />

            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER SECTION */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Join FaithConnect</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Create your {role} account</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {/* ERROR ALERT */}
                {error ? (
                    <View style={[styles.errorBox, { backgroundColor: isDark ? '#3d1010' : '#FEF2F2', borderColor: '#EF4444' }]}>
                        <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 10 }} />
                        <Text style={[styles.error, { color: isDark ? '#fca5a5' : '#B91C1C' }]}>{error}</Text>
                    </View>
                ) : null}

                {/* PHOTO PICKER */}
                <TouchableOpacity onPress={pickImage} disabled={loading} style={styles.avatarSection}>
                    <View style={[styles.avatarContainer, { borderColor: theme.colors.primary }]}>
                        {photo ? (
                            <Image source={{ uri: photo.uri }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#1a1a1a' : '#f3f4f6', borderColor: theme.colors.border }]}>
                                <Ionicons name="camera-outline" size={36} color={theme.colors.primary} />
                                <Text style={[styles.addPhotoText, { color: theme.colors.textSecondary }]}>Add Photo</Text>
                            </View>
                        )}
                        <View style={[styles.photoAddIcon, { backgroundColor: theme.colors.primary }]}>
                            <Ionicons name="add" size={16} color={isDark ? "#000" : "#fff"} />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* FORM INPUTS */}
                <View style={styles.form}>
                    <InputGroup
                        label="Full Name"
                        placeholder="e.g. John Doe"
                        value={form.name}
                        onChange={(v) => setForm({ ...form, name: v })}
                        theme={theme}
                        isDark={isDark}
                    />
                    <InputGroup
                        label="Email Identity"
                        placeholder="email@example.com"
                        value={form.email}
                        onChange={(v) => setForm({ ...form, email: v })}
                        theme={theme}
                        isDark={isDark}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <InputGroup
                        label="Secure Password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(v) => setForm({ ...form, password: v })}
                        theme={theme}
                        isDark={isDark}
                        secureTextEntry
                    />
                </View>

                {/* FAITH SELECTOR */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Personal Faith</Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Select your spiritual path</Text>
                </View>

                <View style={styles.faithGrid}>
                    {FAITH_OPTIONS.map((item) => {
                        const selected = form.faith === item.key;
                        return (
                            <TouchableOpacity
                                key={item.key}
                                onPress={() => setForm({ ...form, faith: item.key })}
                                style={[
                                    styles.faithCard,
                                    {
                                        backgroundColor: selected ? theme.colors.primary + '10' : (isDark ? '#121212' : '#FFFFFF'),
                                        borderColor: selected ? theme.colors.primary : theme.colors.border
                                    },
                                    selected && styles.faithCardActive
                                ]}>
                                <Text style={styles.faithIcon}>{item.icon}</Text>
                                <Text style={[styles.faithLabel, { color: selected ? theme.colors.primary : theme.colors.textSecondary }]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* BIO */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Short Bio</Text>
                </View>
                <TextInput
                    placeholder="Tell the community about yourself..."
                    placeholderTextColor={theme.colors.textSecondary}
                    style={[styles.bioInput, { color: theme.colors.text, backgroundColor: isDark ? '#121212' : '#F9FAFB', borderColor: theme.colors.border }]}
                    value={form.bio}
                    onChangeText={(v) => setForm({ ...form, bio: v })}
                    editable={!loading}
                    multiline
                />

                {/* SUBMIT BUTTON */}
                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: theme.colors.primary }, loading && styles.submitBtnDisabled]}
                    onPress={submit}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color={isDark ? '#000' : '#fff'} />
                    ) : (
                        <Text style={[styles.submitBtnText, { color: isDark ? '#000' : '#fff' }]}>Create Sacred Account</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 60 }} />
            </KeyboardAwareScrollView>
        </View>
    );
};

const InputGroup = ({ label, value, onChange, theme, isDark, ...props }) => (
    <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
        <TextInput
            {...props}
            value={value}
            onChangeText={onChange}
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { color: theme.colors.text, backgroundColor: isDark ? '#121212' : '#F9FAFB', borderColor: theme.colors.border }]}
        />
    </View>
);

export default memo(RegisterScreen);

const styles = StyleSheet.create({
    scrollContent: { paddingHorizontal: 24, paddingVertical: 30 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, marginTop: Platform.OS === 'ios' ? 20 : 10 },
    backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    headerText: { flex: 1, alignItems: 'center' },
    title: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
    subtitle: { fontSize: 13, fontWeight: "600", marginTop: 2 },
    errorBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 25, borderWidth: 1 },
    error: { flex: 1, fontSize: 14, fontWeight: "700" },
    avatarSection: { alignItems: 'center', marginBottom: 40 },
    avatarContainer: { padding: 4, borderRadius: 65, borderWidth: 2, position: 'relative' },
    avatar: { width: 120, height: 120, borderRadius: 60 },
    avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center", borderStyle: "dashed", borderWidth: 2 },
    photoAddIcon: { position: 'absolute', bottom: 5, right: 5, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWeight: 3, borderColor: '#fff' },
    addPhotoText: { fontSize: 12, fontWeight: '800', marginTop: 4 },
    form: { marginBottom: 10 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 13, fontWeight: "800", marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
    input: { height: 60, borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 16, fontSize: 16, fontWeight: '600' },
    sectionHeader: { marginBottom: 16, marginTop: 10 },
    sectionLabel: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
    sectionSubtitle: { fontSize: 14, fontWeight: "500", marginTop: 4 },
    faithGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
    faithCard: { width: "48%", borderWidth: 1.5, borderRadius: 20, paddingVertical: 20, alignItems: "center", marginBottom: 14 },
    faithCardActive: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
    faithIcon: { fontSize: 36, marginBottom: 8 },
    faithLabel: { fontSize: 14, fontWeight: "900" },
    bioInput: { height: 120, borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 18, fontSize: 16, fontWeight: '600', textAlignVertical: 'top', marginBottom: 30 },
    submitBtn: { height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { fontSize: 17, fontWeight: "900" },
});