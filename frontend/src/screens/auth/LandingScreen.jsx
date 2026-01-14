import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    StatusBar,
} from "react-native";
import { useEffect, useRef, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

export default function LandingScreen({ navigation }) {
    const { theme, isDark } = useContext(ThemeContext);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const goRegister = (role) => {
        navigation.navigate("Register", { role });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.barStyle} />

            {/* Gradient Background (Themed) */}
            <View style={styles.gradientContainer}>
                <View style={[styles.gradientCircle, styles.gradientCircle1, { backgroundColor: theme.colors.primary, opacity: isDark ? 0.08 : 0.12 }]} />
                <View style={[styles.gradientCircle, styles.gradientCircle2, { backgroundColor: theme.colors.accent, opacity: isDark ? 0.08 : 0.12 }]} />
            </View>

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    },
                ]}
            >
                {/* LOGO / BRAND */}
                <View style={styles.brandContainer}>
                    <MaterialCommunityIcons
                        name="hands-pray"
                        size={80}
                        color={theme.colors.primary}
                        style={styles.logoIcon}
                    />
                    <Text style={[styles.brandText, { color: theme.colors.text }]}>FaithConnect</Text>
                    <View style={[styles.brandUnderline, { backgroundColor: theme.colors.primary }]} />
                </View>

                {/* TAGLINE */}
                <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
                    A sacred space where worshipers connect{"\n"}
                    with their spiritual leaders
                </Text>

                {/* CTA SECTION */}
                <View style={styles.ctaContainer}>
                    <TouchableOpacity
                        style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]}
                        activeOpacity={0.85}
                        onPress={() => goRegister("worshiper")}
                    >
                        <View style={styles.btnContent}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name="people" size={28} color={isDark ? "#000" : "#fff"} />
                            </View>
                            <View>
                                <Text style={[styles.primaryBtnText, { color: isDark ? '#000' : '#fff' }]}>
                                    Continue as Worshiper
                                </Text>
                                <Text style={[styles.btnSubtext, { color: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)' }]}>
                                    Connect with your faith community
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                        activeOpacity={0.85}
                        onPress={() => goRegister("leader")}
                    >
                        <View style={styles.btnContent}>
                            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                                <MaterialCommunityIcons name="crown" size={28} color={theme.colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.secondaryBtnText, { color: theme.colors.text }]}>
                                    Continue as Religious Leader
                                </Text>
                                <Text style={[styles.btnSubtextDark, { color: theme.colors.textSecondary }]}>
                                    Guide and inspire your community
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* LOGIN */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("Login")}
                    activeOpacity={0.7}
                    style={styles.loginContainer}
                >
                    <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                        Already have an account?{" "}
                        <Text style={[styles.loginHighlight, { color: theme.colors.primary }]}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradientContainer: { position: "absolute", width: "100%", height: "100%" },
    gradientCircle: { position: "absolute", borderRadius: 1000 },
    gradientCircle1: { width: 400, height: 400, top: -100, right: -100 },
    gradientCircle2: { width: 300, height: 300, bottom: -50, left: -50 },
    content: { flex: 1, justifyContent: "center", paddingHorizontal: 32 },
    brandContainer: { alignItems: "center", marginBottom: 16 },
    logoIcon: { marginBottom: 12 },
    brandText: { fontSize: 38, fontWeight: "900", textAlign: "center", letterSpacing: -1 },
    brandUnderline: { width: 60, height: 5, borderRadius: 3, marginTop: 8 },
    tagline: { textAlign: "center", fontSize: 16, lineHeight: 24, marginBottom: 56, fontWeight: "500" },
    ctaContainer: { marginBottom: 32 },
    primaryBtn: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 20, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 6 },
    btnContent: { flexDirection: "row", alignItems: "center", gap: 16 },
    iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    primaryBtnText: { fontSize: 17, fontWeight: "800", marginBottom: 2 },
    btnSubtext: { fontSize: 12, fontWeight: "500" },
    secondaryBtn: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 20, borderWidth: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    secondaryBtnText: { fontSize: 17, fontWeight: "800", marginBottom: 2 },
    btnSubtextDark: { fontSize: 12, fontWeight: "500" },
    loginContainer: { paddingVertical: 12 },
    loginText: { textAlign: "center", fontSize: 15, fontWeight: "600" },
    loginHighlight: { fontWeight: "800" },
});
