import {
    View,
    TextInput,
    StyleSheet,
    Text,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { useState, useContext, memo } from "react";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import api from "../../services/api.service";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const LoginScreen = () => {
    const { setSession } = useContext(AuthContext);
    const { theme, isDark } = useContext(ThemeContext);
    const navigation = useNavigation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const submit = async () => {
        if (loading) return;
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Email and password are required");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/auth/login", {
                email: email.trim().toLowerCase(),
                password: password.trim()
            });

            await setSession(res.data.data);

            const user = res.data.data.user;
            if (!user.name || !user.faith) {
                navigation.replace("ProfileSetup");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar barStyle={theme.barStyle} />

            {/* Background Decorations - PointerEvents none to prevent touch interference */}
            <View style={styles.gradientContainer} pointerEvents="none">
                <View style={[styles.gradientCircle, styles.gradientCircle1, { backgroundColor: theme.colors.primary, opacity: isDark ? 0.08 : 0.12 }]} />
                <View style={[styles.gradientCircle, styles.gradientCircle2, { backgroundColor: theme.colors.accent, opacity: isDark ? 0.08 : 0.12 }]} />
            </View>

            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                extraScrollHeight={Platform.OS === "ios" ? 50 : 0}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* BRAND SECTION */}
                    <View style={styles.brandContainer}>
                        <MaterialCommunityIcons
                            name="hands-pray"
                            size={64}
                            color={theme.colors.primary}
                            style={{ marginBottom: 16 }}
                        />
                        <Text style={[styles.brand, { color: theme.colors.text }]}>FaithConnect</Text>
                    </View>

                    {/* TITLES */}
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Welcome back</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Sign in to continue your spiritual journey
                        </Text>
                    </View>

                    {/* ERROR BOX */}
                    {error ? (
                        <View style={[styles.errorContainer, { backgroundColor: isDark ? '#3d1010' : '#FEF2F2', borderColor: '#EF4444' }]}>
                            <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                            <Text style={[styles.error, { color: isDark ? '#fca5a5' : '#B91C1C' }]}>{error}</Text>
                        </View>
                    ) : null}

                    {/* FORM FIELDS */}
                    <View style={styles.form}>
                        <View style={[
                            styles.inputWrapper,
                            {
                                backgroundColor: isDark ? '#121212' : '#F9FAFB',
                                borderColor: emailFocused ? theme.colors.primary : theme.colors.border,
                                borderWidth: emailFocused ? 2 : 1.5,
                            }
                        ]}>
                            <Ionicons name="mail-outline" size={20} color={emailFocused ? theme.colors.primary : theme.colors.textSecondary} style={{ marginRight: 12 }} />
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                placeholder="Email address"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                autoComplete="email"
                                keyboardType="email-address"
                                editable={!loading}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                returnKeyType="next"
                            />
                        </View>

                        <View style={[
                            styles.inputWrapper,
                            {
                                backgroundColor: isDark ? '#121212' : '#F9FAFB',
                                borderColor: passwordFocused ? theme.colors.primary : theme.colors.border,
                                borderWidth: passwordFocused ? 2 : 1.5,
                            }
                        ]}>
                            <Ionicons name="lock-closed-outline" size={20} color={passwordFocused ? theme.colors.primary : theme.colors.textSecondary} style={{ marginRight: 12 }} />
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                placeholder="Password"
                                placeholderTextColor={theme.colors.textSecondary}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                editable={!loading}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                returnKeyType="done"
                                onSubmitEditing={submit}
                            />
                        </View>
                    </View>

                    {/* CTA SECTION */}
                    <TouchableOpacity
                        style={[
                            styles.btn,
                            { backgroundColor: theme.colors.primary },
                            loading && { opacity: 0.7 }
                        ]}
                        onPress={submit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={isDark ? '#000' : '#fff'} />
                        ) : (
                            <Text style={[styles.btnText, { color: isDark ? '#000' : '#fff' }]}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    {/* FOOTER */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Landing")}
                        activeOpacity={0.6}
                        style={styles.footer}
                    >
                        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                            Don't have an account?{" "}
                            <Text style={[styles.footerHighlight, { color: theme.colors.primary }]}>Create one</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </View>
    );
};

export default memo(LoginScreen);

const styles = StyleSheet.create({
    scrollContent: { flexGrow: 1 },
    gradientContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    gradientCircle: { position: "absolute", borderRadius: 1000 },
    gradientCircle1: { width: 400, height: 400, top: -180, right: -120 },
    gradientCircle2: { width: 300, height: 300, bottom: -100, left: -100 },
    content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center', paddingVertical: 50 },
    brandContainer: { alignItems: "center", marginBottom: 30 },
    brand: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
    headerTextContainer: { marginBottom: 35 },
    title: { fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 10 },
    subtitle: { textAlign: "center", fontSize: 16, fontWeight: "500", lineHeight: 24 },
    errorContainer: { flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 14, marginBottom: 25, borderWidth: 1 },
    error: { flex: 1, fontSize: 14, fontWeight: "600" },
    form: { marginBottom: 30 },
    inputWrapper: { flexDirection: "row", alignItems: "center", borderRadius: 18, marginBottom: 18, paddingHorizontal: 16, height: 64, borderWidth: 1.5 },
    input: { flex: 1, fontSize: 16, fontWeight: "600" },
    btn: { height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
    btnText: { fontSize: 18, fontWeight: "800" },
    footer: { marginTop: 20, paddingVertical: 10 },
    footerText: { textAlign: "center", fontSize: 15, fontWeight: "600" },
    footerHighlight: { fontWeight: "900" },
});
