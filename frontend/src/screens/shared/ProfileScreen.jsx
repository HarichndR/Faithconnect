import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert, StyleSheet, StatusBar } from "react-native";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

import AppHeader from "../../components/AppHeader";
import { logger } from "../../services/log.service";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const { theme, isDark } = useContext(ThemeContext);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState(user);

    useEffect(() => {
        setProfileData(user);
    }, [user]);

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        await logout();
                    } catch (err) {
                        logger.error("Logout failed", err);
                        Alert.alert("Error", "Failed to logout");
                    }
                },
            },
        ]);
    };

    const MenuItem = ({ icon, label, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
        >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons name={icon} size={22} color={theme.colors.primary} />
                <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
                    {label}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.barStyle} />
            <AppHeader user={user} onProfilePress={() => { }} />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Profile Header */}
                    <View style={[styles.profileHeader, { borderBottomColor: theme.colors.border }]}>
                        <View style={[styles.avatarContainer, { borderColor: theme.colors.primary }]}>
                            {profileData?.profilePhoto ? (
                                <Image source={{ uri: profileData.profilePhoto }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
                                    <Ionicons name="person" size={40} color={isDark ? "#000" : "#fff"} />
                                </View>
                            )}
                        </View>

                        <Text style={[styles.name, { color: theme.colors.text }]}>
                            {profileData?.name || "Profile"}
                        </Text>

                        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
                            {profileData?.faith} • {profileData?.role}
                        </Text>

                        <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>
                            {profileData?.bio || "No bio"}
                        </Text>

                        {/* Follow Stats */}
                        <View style={styles.statsRow}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate("FollowersList", { userId: profileData._id })}
                            >
                                <View style={styles.stat}>
                                    <Text style={[styles.statNum, { color: theme.colors.text }]}>
                                        {profileData?.followers?.length || 0}
                                    </Text>
                                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                        Followers
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate("FollowingList", { userId: profileData._id })}
                            >
                                <View style={styles.stat}>
                                    <Text style={[styles.statNum, { color: theme.colors.text }]}>
                                        {profileData?.following?.length || 0}
                                    </Text>
                                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                        Following
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.editButton, { borderColor: theme.colors.primary }]}
                            onPress={() => navigation.navigate("EditProfile")}
                        >
                            <Text style={[styles.editButtonText, { color: theme.colors.primary }]}>
                                Edit Profile
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Menu Items */}
                    <View style={styles.menuContainer}>
                        <MenuItem
                            icon="bookmark-outline"
                            label="Saved"
                            onPress={() => navigation.navigate("SavedPosts")}
                        />
                        <MenuItem
                            icon="heart-outline"
                            label="Liked"
                            onPress={() => navigation.navigate("LikedPosts")}
                        />
                        <MenuItem
                            icon="cog-outline"
                            label="Settings"
                            onPress={() => navigation.navigate("Settings")}
                        />
                        <MenuItem
                            icon="help-circle-outline"
                            label="Help & Support"
                            onPress={() => navigation.navigate("Help")}
                        />
                        <MenuItem
                            icon="logout"
                            label="Logout"
                            onPress={handleLogout}
                        />
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 12 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    profileHeader: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        alignItems: "center",
        borderBottomWidth: 1,
    },
    avatarContainer: {
        padding: 4,
        borderRadius: 50,
        borderWidth: 2,
        marginBottom: 12,
    },
    avatar: { width: 86, height: 86, borderRadius: 43 },
    avatarFallback: { justifyContent: "center", alignItems: "center" },
    name: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
    meta: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
    bio: { fontSize: 14, textAlign: "center", paddingHorizontal: 40, lineHeight: 20, marginBottom: 20 },
    statsRow: { flexDirection: "row", justifyContent: "center", gap: 40, marginBottom: 24 },
    stat: { alignItems: "center" },
    statNum: { fontSize: 18, fontWeight: "800" },
    statLabel: { fontSize: 12, marginTop: 2, fontWeight: "500" },
    editButton: { width: "100%", paddingVertical: 12, borderRadius: 25, borderWidth: 1.5 },
    editButtonText: { textAlign: "center", fontSize: 15, fontWeight: "700" },
    menuContainer: { marginTop: 8 },
    menuItem: { paddingVertical: 16, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1 },
    menuLabel: { fontSize: 15, fontWeight: "600", marginLeft: 15 },
});
