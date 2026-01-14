import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContext, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import NotificationDropdown from "./NotificationDropdown";

export default function AppHeader({ user, onProfilePress }) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { user: authUser } = useContext(AuthContext);
    const { theme, isDark } = useContext(ThemeContext);

    const [showNotifications, setShowNotifications] = useState(false);

    const handleProfilePress = () => {
        if (typeof onProfilePress === "function") return onProfilePress();
        navigation.navigate("Profile");
    };

    const handleSettingPress = () => {
        navigation.navigate("Settings");
    };

    return (
        <View style={{ backgroundColor: theme.colors.background }}>
            {/* HEADER */}
            <View style={[styles.header, {
                backgroundColor: theme.colors.background,
                borderBottomColor: theme.colors.border,
                paddingTop: Math.max(insets.top, 12),
                height: Math.max(insets.top, 12) + 60,
            }]}>
                {/* LEFT – PROFILE */}
                <TouchableOpacity
                    onPress={handleProfilePress}
                    style={styles.profileButton}
                    activeOpacity={0.7}
                >
                    {user?.profilePhoto ? (
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: user.profilePhoto }}
                                style={[styles.profileImage, { borderColor: theme.colors.primary }]}
                            />
                            <View style={[styles.activeDot, { borderColor: theme.colors.background }]} />
                        </View>
                    ) : (
                        <View style={[styles.profileFallback, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border }]}>
                            <Ionicons name="person" size={20} color={isDark ? "#000" : "#fff"} />
                        </View>
                    )}
                </TouchableOpacity>

                {/* CENTER – BRAND (Themed Icon) */}
                <View style={styles.brandContainer}>
                    <MaterialCommunityIcons
                        name="hands-pray"
                        size={28}
                        color={theme.colors.primary}
                        style={styles.brandIcon}
                    />
                    <Text style={[styles.brandText, { color: theme.colors.text }]}>FaithConnect</Text>
                </View>

                {/* RIGHT – NOTIFICATION + SETTINGS */}
                <View style={styles.actionsContainer}>
                    {/* 🔔 NOTIFICATION BELL */}
                    <TouchableOpacity
                        onPress={() => setShowNotifications(true)}
                        style={styles.iconButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={authUser?.unreadNotifications > 0 ? "notifications" : "notifications-outline"}
                            size={24}
                            color={theme.colors.primary}
                        />

                        {authUser?.unreadNotifications > 0 && (
                            <View style={[styles.badge, { borderColor: theme.colors.background }]}>
                                <Text style={styles.badgeText}>
                                    {authUser.unreadNotifications > 9 ? '9+' : authUser.unreadNotifications}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* ⚙️ SETTINGS */}
                    <TouchableOpacity
                        onPress={handleSettingPress}
                        style={styles.iconButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 🔽 NOTIFICATION DROPDOWN */}
            <NotificationDropdown
                visible={showNotifications}
                onClose={() => setShowNotifications(false)}
                navigation={navigation}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        zIndex: 100,
    },

    profileButton: {
        flex: 0.25,
        justifyContent: "center",
    },

    avatarWrapper: {
        position: 'relative',
        width: 40,
        height: 40,
    },

    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
    },

    profileFallback: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
    },

    activeDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
        borderWidth: 2,
    },

    brandContainer: {
        flex: 0.5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },

    brandIcon: {
        // Subtle offset for the pray hands icon
        marginTop: -2,
    },

    brandText: {
        fontSize: 20,
        fontWeight: "900",
        letterSpacing: -0.5,
    },

    actionsContainer: {
        flex: 0.25,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 8,
    },

    iconButton: {
        padding: 6,
        position: "relative",
    },

    badge: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: "#EF4444",
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 3,
        borderWidth: 1.5,
    },

    badgeText: {
        color: "#fff",
        fontSize: 8,
        fontWeight: "900",
    },
});
