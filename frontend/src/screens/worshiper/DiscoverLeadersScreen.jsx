import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    StyleSheet,
} from "react-native";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api.service";
import AppHeader from "../../components/AppHeader";
import { logger } from "../../services/log.service";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

/* ---------------- TABS ---------------- */
const TABS = ["Explore", "Following"];

export default function DiscoverLeadersScreen({ navigation }) {
    const { user, setUser } = useContext(AuthContext);
    const { theme, isDark } = useContext(ThemeContext);
    const followingIds = Array.isArray(user?.following) ? user.following : [];

    const [leaders, setLeaders] = useState([]);
    const [activeTab, setActiveTab] = useState("Explore");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLeaders();
    }, []);

    /* ---------------- FETCH ---------------- */
    const fetchLeaders = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/leaders");
            setLeaders(res.data.data || []);
        } catch (err) {
            logger.error("Fetch leaders failed", err);
            setError("Failed to load leaders");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- FILTER ---------------- */
    const filteredLeaders = useMemo(() => {
        if (activeTab === "Following") {
            return leaders.filter((l) =>
                followingIds.includes(l._id)
            );
        }

        return leaders.filter(
            (l) => !followingIds.includes(l._id)
        );
    }, [leaders, activeTab, followingIds]);


    /* ---------------- FOLLOW / UNFOLLOW ---------------- */
    const toggleFollow = async (leaderId, isFollowing) => {
        try {
            if (!user) return;

            if (isFollowing) {
                await api.delete(`/leaders/${leaderId}/follow`);

                setUser((prev) => ({
                    ...prev,
                    following: (prev.following || []).filter(
                        (id) => id !== leaderId
                    ),
                }));
            } else {
                await api.post(`/leaders/${leaderId}/follow`);

                setUser((prev) => ({
                    ...prev,
                    following: [...(prev.following || []), leaderId],
                }));
            }
        } catch (err) {
            logger.error("Follow toggle failed", err);
        }
    };

    /* ---------------- CARD ---------------- */
    const LeaderCard = ({ leader }) => {
        const isFollowing = followingIds.includes(leader._id);

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                    navigation.navigate("LeaderProfile", { leaderId: leader._id })
                }}
                style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            >
                <View style={styles.avatarWrap}>
                    {leader.profilePhoto ? (
                        <Image source={{ uri: leader.profilePhoto }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
                            <Ionicons name="person" size={26} color={isDark ? "#000" : "#fff"} />
                        </View>
                    )}
                </View>

                <View style={styles.info}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>{leader.name}</Text>
                    <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{leader.faith}</Text>
                    </View>
                    <Text numberOfLines={2} style={[styles.bio, { color: theme.colors.textSecondary }]}>
                        {leader.bio || "No bio available"}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => toggleFollow(leader._id, isFollowing)}
                    style={[
                        styles.followBtn,
                        { backgroundColor: isFollowing ? (isDark ? '#333' : '#f0f0f0') : theme.colors.primary },
                    ]}
                >
                    <Text
                        style={[
                            styles.followText,
                            { color: isFollowing ? (isDark ? '#fff' : '#000') : (isDark ? '#000' : '#fff') },
                        ]}
                    >
                        {isFollowing ? "Unfollow" : "Follow"}
                    </Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    /* ---------------- UI ---------------- */
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader user={user} onProfilePress={() => navigation.navigate("Profile")} />

            {/* SUB TABS */}
            <View style={[styles.tabs, { borderColor: theme.colors.border }]}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[
                            styles.tab,
                            activeTab === tab && [styles.activeTab, { borderColor: theme.colors.primary }],
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: theme.colors.textSecondary },
                                activeTab === tab && [styles.activeTabText, { color: theme.colors.primary }],
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={{ color: theme.colors.error }}>{error}</Text>
                </View>
            ) : filteredLeaders.length === 0 ? (
                <View style={styles.center}>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                        {activeTab === "Following"
                            ? "You are not following anyone yet"
                            : "No leaders to discover"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredLeaders}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => <LeaderCard leader={item} />}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 12 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    tabs: { flexDirection: "row", borderBottomWidth: 1 },
    tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
    activeTab: { borderBottomWidth: 3 },
    tabText: { fontWeight: "600", fontSize: 15 },
    activeTabText: { fontWeight: "700" },
    card: {
        flexDirection: "row",
        padding: 16,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        alignItems: "center",
        borderWidth: 1,
    },
    avatarWrap: { marginRight: 15 },
    avatar: { width: 60, height: 60, borderRadius: 30 },
    avatarFallback: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center" },
    info: { flex: 1 },
    name: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
    badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginBottom: 8 },
    badgeText: { fontSize: 11, fontWeight: "700" },
    bio: { fontSize: 13, lineHeight: 18 },
    followBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
    followText: { fontWeight: "700", fontSize: 13 },
    emptyText: { fontSize: 15 }
});
