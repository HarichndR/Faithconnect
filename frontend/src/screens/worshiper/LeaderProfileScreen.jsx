import {
    View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, StyleSheet, FlatList, Dimensions, StatusBar
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api.service";
import { reelService } from "../../services/reel.service";
import { postService } from "../../services/post.service";
import { ThemeContext } from "../../context/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function LeaderProfileScreen({ navigation, route }) {
    const { leaderId } = route.params || {};
    const { user, setUser } = useContext(AuthContext);
    const { theme, isDark } = useContext(ThemeContext);

    const [leader, setLeader] = useState(null);
    const [posts, setPosts] = useState([]);
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Posts");

    const isFollowing = user?.following?.includes(leaderId) || false;

    useEffect(() => {
        loadData();
    }, [leaderId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [userRes, postsRes, reelsRes] = await Promise.all([
                api.get(`/users/${leaderId}`),
                postService.getByUser(leaderId),
                reelService.getByUser(leaderId)
            ]);

            setLeader(userRes.data.data);
            setPosts(postsRes.data.data || []);
            setReels(reelsRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFollow = async () => {
        try {
            if (isFollowing) {
                await api.delete(`/leaders/${leaderId}/follow`);
                setUser(prev => ({
                    ...prev,
                    following: prev.following.filter(id => id !== leaderId)
                }));
            } else {
                await api.post(`/leaders/${leaderId}/follow`);
                setUser(prev => ({
                    ...prev,
                    following: [...prev.following, leaderId]
                }));
            }
        } catch (err) {
            console.error("Follow error", err);
        }
    };

    const handleMessage = () => {
        navigation.navigate("Chat", {
            otherUser: leader
        });
    };

    /* ---------------- RENDERERS ---------------- */
    const renderPost = ({ item }) => (
        <TouchableOpacity
            style={[styles.postCard, { backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9', borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate("PostDetail", { postId: item._id })}
        >
            {item.mediaUrl ? (
                <Image source={{ uri: item.mediaUrl }} style={styles.postImage} resizeMode="cover" />
            ) : (
                <View style={styles.textPost}>
                    <Text numberOfLines={5} style={[styles.postTextPreview, { color: theme.colors.text }]}>{item.text}</Text>
                </View>
            )}
            {item.mediaType === 'VIDEO' && (
                <Ionicons name="play" size={20} color="#fff" style={styles.playIconPost} />
            )}
        </TouchableOpacity>
    );

    const renderReel = ({ item, index }) => {
        const thumbUrl = item.thumbnailUrl || (item.videoUrl ? item.videoUrl.replace(/\.[^/.]+$/, ".jpg").replace("/upload/", "/upload/so_0/") : null);

        return (
            <TouchableOpacity
                style={[styles.reelCard, { borderColor: theme.colors.border }]}
                onPress={() => navigation.navigate("ReelsFeed", {
                    initialReels: reels,
                    initialIndex: index
                })}
            >
                {thumbUrl ? (
                    <Image source={{ uri: thumbUrl }} style={styles.reelImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.reelImage, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="play" size={30} color={theme.colors.textSecondary} />
                    </View>
                )}
                <View style={styles.reelOverlay}>
                    <Ionicons name="play" size={16} color="#fff" />
                    <Text style={styles.reelViews}>{item.views || 0}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!leader) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.text }}>User not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.barStyle} />
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{leader.name}</Text>
                <TouchableOpacity onPress={() => { }}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Info */}
                <View style={styles.profileInfo}>
                    <View style={[styles.avatarContainer, { borderColor: theme.colors.primary }]}>
                        {leader.profilePhoto ? (
                            <Image source={{ uri: leader.profilePhoto }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
                                <Ionicons name="person" size={40} color={isDark ? "#000" : "#fff"} />
                            </View>
                        )}
                    </View>

                    <Text style={[styles.name, { color: theme.colors.text }]}>{leader.name}</Text>
                    <View style={styles.badgeRow}>
                        <View style={[styles.faithBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Text style={[styles.faith, { color: theme.colors.primary }]}>{leader.faith}</Text>
                        </View>
                        <Text style={[styles.role, { color: theme.colors.textSecondary }]}>{leader.role}</Text>
                    </View>

                    {leader.bio && <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>{leader.bio}</Text>}

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={[styles.statNum, { color: theme.colors.text }]}>{posts.length}</Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Posts</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={[styles.statNum, { color: theme.colors.text }]}>{leader.followers?.length || 0}</Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Followers</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={[styles.statNum, { color: theme.colors.text }]}>{leader.following?.length || 0}</Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Following</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.btn, isFollowing ? [styles.outlineBtn, { borderColor: theme.colors.border }] : { backgroundColor: theme.colors.primary }]}
                            onPress={toggleFollow}
                        >
                            <Text style={[styles.btnText, { color: isFollowing ? theme.colors.text : (isDark ? '#000' : '#fff') }]}>
                                {isFollowing ? "Following" : "Follow"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, styles.secondaryBtn, { backgroundColor: isDark ? '#333' : '#F3F4F6' }]}
                            onPress={handleMessage}
                        >
                            <Text style={[styles.btnText, { color: theme.colors.text }]}>Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tabs */}
                <View style={[styles.tabs, { borderTopColor: theme.colors.border }]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "Posts" && [styles.activeTab, { borderBottomColor: theme.colors.primary }]]}
                        onPress={() => setActiveTab("Posts")}
                    >
                        <MaterialCommunityIcons
                            name="grid"
                            size={24}
                            color={activeTab === "Posts" ? theme.colors.primary : theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "Reels" && [styles.activeTab, { borderBottomColor: theme.colors.primary }]]}
                        onPress={() => setActiveTab("Reels")}
                    >
                        <MaterialCommunityIcons
                            name="movie-play"
                            size={24}
                            color={activeTab === "Reels" ? theme.colors.primary : theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={[styles.contentArea, { backgroundColor: theme.colors.background }]}>
                    {activeTab === "Posts" ? (
                        <FlatList
                            data={posts}
                            keyExtractor={item => item._id}
                            renderItem={renderPost}
                            numColumns={3}
                            scrollEnabled={false}
                            ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No posts yet</Text>}
                        />
                    ) : (
                        <FlatList
                            data={reels}
                            keyExtractor={item => item._id}
                            renderItem={renderReel}
                            numColumns={3}
                            scrollEnabled={false}
                            ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No reels yet</Text>}
                        />
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 10,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 17, fontWeight: "700" },
    backBtn: { padding: 4 },
    profileInfo: { alignItems: "center", padding: 20 },
    avatarContainer: {
        padding: 4,
        borderWidth: 2,
        borderRadius: 50,
        marginBottom: 10
    },
    avatar: {
        width: 86, height: 86, borderRadius: 43,
    },
    avatarFallback: {
        justifyContent: "center",
        alignItems: "center",
    },
    name: { fontSize: 22, fontWeight: "800", marginTop: 4 },
    badgeRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 },
    faithBadge: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 12,
    },
    faith: { fontSize: 12, fontWeight: "700" },
    role: { fontSize: 13, fontWeight: "500" },
    bio: { marginTop: 12, textAlign: "center", paddingHorizontal: 30, lineHeight: 18, fontSize: 14 },
    statsRow: { flexDirection: "row", width: '100%', justifyContent: 'space-around', marginTop: 24 },
    stat: { alignItems: "center" },
    statNum: { fontSize: 18, fontWeight: "800" },
    statLabel: { fontSize: 12, marginTop: 2 },
    actionRow: { flexDirection: "row", gap: 12, marginTop: 24, width: "100%", paddingHorizontal: 10 },
    btn: { flex: 1, paddingVertical: 12, borderRadius: 25, alignItems: "center", justifyContent: 'center' },
    secondaryBtn: {},
    btnText: { fontWeight: "700", fontSize: 15 },
    outlineBtn: { borderWidth: 1 },
    tabs: { flexDirection: "row", borderTopWidth: 1, marginTop: 10 },
    tab: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
    activeTab: {},
    contentArea: { minHeight: 400 },
    postCard: { width: width / 3 - 2, height: width / 3 - 2, margin: 1, borderWidth: 0.5, borderRadius: 4, overflow: 'hidden' },
    postImage: { width: "100%", height: "100%" },
    textPost: { flex: 1, justifyContent: "center", alignItems: "center", padding: 10 },
    postTextPreview: { fontSize: 11, textAlign: 'center', fontWeight: '500' },
    playIconPost: { position: 'absolute', bottom: 5, right: 5 },
    reelCard: { width: width / 3 - 2, height: (width / 3) * 1.6, margin: 1, borderRadius: 4, overflow: 'hidden', backgroundColor: '#000' },
    reelImage: { width: "100%", height: "100%", backgroundColor: "#000" },
    reelOverlay: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
    reelViews: { color: '#fff', fontSize: 11, fontWeight: '700' },
    emptyText: { textAlign: 'center', marginTop: 40, fontSize: 15 }
});
