import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { api } from "../../services/api.service";
import PostCard from "../../components/PostCard";
import { Ionicons } from "@expo/vector-icons";

const TABS = ["Followers", "Posts", "Reels"];

export default function LeaderDashboardScreen({ navigation }) {
  const isFocused = useIsFocused();
  const { user } = useContext(AuthContext);
  const { theme, isDark } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState("Followers");
  const [followers, setFollowers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  /* ---------------- API CALLS ---------------- */

  const fetchData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      await Promise.all([
        fetchFollowers(),
        fetchPosts(),
        fetchReels(),
      ]);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const res = await api.get(`/users/${user._id}/followers`);
      setFollowers(res.data.data || []);
    } catch (err) {
      setFollowers([]);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts/my");
      setPosts(res.data.data || []);
    } catch (err) {
      setPosts([]);
    }
  };

  const fetchReels = async () => {
    try {
      const res = await api.get("/reels/my");
      setReels(res.data.data || []);
    } catch (err) {
      setReels([]);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  /* ---------------- HANDLERS ---------------- */

  const handleStartChat = async (userId) => {
    try {
      const res = await api.post("/chats/start", { otherUserId: userId });
      const chat = res.data.data;
      const otherUser = chat.participants.find(p => p._id !== user._id);

      navigation.navigate("Chat", {
        chatId: chat._id,
        otherUser: otherUser,
      });
    } catch (err) {
      console.error("Start chat error:", err);
      navigation.navigate("Chat", { otherUser: { _id: userId } });
    }
  };

  /* ---------------- RENDERS ---------------- */

  const renderFollower = ({ item }) => (
    <View style={[styles.followerCard, { borderBottomColor: theme.colors.border }]}>
      {item.profilePhoto ? (
        <Image source={{ uri: item.profilePhoto }} style={[styles.avatar, { borderColor: theme.colors.border }]} />
      ) : (
        <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border }]}>
          <Ionicons name="person" size={24} color={isDark ? "#000" : "#fff"} />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>{item.faith}</Text>
        {item.bio && (
          <Text style={[styles.bio, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.bio}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => handleStartChat(item._id)}
        style={[styles.messageBtn, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="chatbubble" size={18} color={isDark ? "#000" : "#fff"} />
      </TouchableOpacity>
    </View>
  );

  const renderReel = ({ item, index }) => {
    // Robust thumbnail logic for old reels
    const thumbUrl = item.thumbnailUrl || (item.videoUrl ? item.videoUrl.replace(/\.[^/.]+$/, ".jpg").replace("/upload/", "/upload/so_0/") : null);

    return (
      <TouchableOpacity
        style={[styles.reelCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        onPress={() => navigation.navigate("ReelsFeed", {
          initialReels: reels,
          initialIndex: index
        })}
      >
        <View style={[styles.reelThumbnail, { backgroundColor: isDark ? '#1a1a1a' : '#f3f4f6' }]}>
          {thumbUrl ? (
            <Image source={{ uri: thumbUrl }} style={styles.thumbnailImage} resizeMode="cover" />
          ) : (
            <Ionicons name="play-circle" size={48} color={theme.colors.primary} />
          )}
          <View style={styles.reelOverlay}>
            <Ionicons name="play" size={16} color="#fff" />
          </View>
        </View>
        <Text style={[styles.reelCaption, { color: theme.colors.text }]} numberOfLines={2}>
          {item.caption || "Reel"}
        </Text>
        <View style={styles.reelStats}>
          <View style={styles.reelStat}>
            <Ionicons name="heart" size={14} color="#EF4444" />
            <Text style={[styles.reelStatText, { color: theme.colors.textSecondary }]}>{item.likes?.length || 0}</Text>
          </View>
          <View style={styles.reelStat}>
            <Ionicons name="eye" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.reelStatText, { color: theme.colors.textSecondary }]}>{item.views || 0}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
        </View>
      );
    }

    if (activeTab === "Followers") {
      return (
        <FlatList
          key="followers-list"
          data={followers}
          keyExtractor={(i) => i._id}
          renderItem={renderFollower}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No followers yet</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Share your content to gain followers</Text>
            </View>
          }
        />
      );
    }

    if (activeTab === "Posts") {
      return (
        <FlatList
          key="posts-list"
          data={posts}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <PostCard post={item} onPostUpdate={() => fetchPosts()} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No posts yet</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Create your first post to share with followers</Text>
            </View>
          }
        />
      );
    }

    if (activeTab === "Reels") {
      return (
        <FlatList
          key="reels-grid"
          data={reels}
          keyExtractor={(i) => i._id}
          renderItem={renderReel}
          numColumns={2}
          columnWrapperStyle={styles.reelRow}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎬</Text>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No reels yet</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Create short videos to engage your followers</Text>
            </View>
          }
        />
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.barStyle} />
      {/* ---------------- HEADER ---------------- */}
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* GO LIVE BUTTON FOR LEADERS */}
      <TouchableOpacity
        style={[styles.goLiveBtn, { backgroundColor: theme.colors.primary }]}
        onPress={async () => {
          try {
            const { conferenceService } = require("../../services/conference.service");
            const res = await conferenceService.create({
              title: `${user.name}'s Live Session`,
              description: "Join me for a spiritual live conference."
            });
            navigation.navigate("LiveStream", {
              roomId: res.data.data.roomId,
              title: res.data.data.title
            });
          } catch (err) {
            Alert.alert("Error", "Could not create session");
          }
        }}
      >
        <Ionicons name="videocam" size={24} color={isDark ? "#000" : "#fff"} />
        <Text style={[styles.goLiveText, { color: isDark ? "#000" : "#fff" }]}>GO LIVE</Text>
      </TouchableOpacity>

      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            {/* ---------------- PROFILE CARD ---------------- */}
            <View style={[styles.profileCard, { borderBottomColor: theme.colors.border }]}>
              <View style={[styles.profileImgContainer, { borderColor: theme.colors.primary }]}>
                {user.profilePhoto ? (
                  <Image source={{ uri: user.profilePhoto }} style={styles.profileImg} />
                ) : (
                  <View style={[styles.profileImg, styles.profileImgFallback, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="person" size={40} color={isDark ? "#000" : "#fff"} />
                  </View>
                )}
              </View>

              <Text style={[styles.profileName, { color: theme.colors.text }]}>{user.name}</Text>
              <Text style={[styles.profileFaith, { color: theme.colors.primary }]}>{user.faith}</Text>

              {user.bio && <Text style={[styles.profileBio, { color: theme.colors.textSecondary }]}>{user.bio}</Text>}

              <View style={styles.statsRow}>
                <Stat label="Followers" value={followers.length} theme={theme} />
                <Stat label="Posts" value={posts.length} theme={theme} />
                <Stat label="Reels" value={reels.length} theme={theme} />
              </View>
            </View>

            {/* ---------------- TABS ---------------- */}
            <View style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
              {TABS.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setActiveTab(t)}
                  style={styles.tab}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: theme.colors.textSecondary },
                      activeTab === t && [styles.activeTabText, { color: theme.colors.primary }],
                    ]}
                  >
                    {t}
                  </Text>
                  {activeTab === t && <View style={[styles.tabIndicator, { backgroundColor: theme.colors.primary }]} />}
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListFooterComponent={renderContent()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function Stat({ label, value, theme }) {
  return (
    <View style={styles.statContainer}>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, fontWeight: "800" },
  profileCard: { alignItems: "center", padding: 24, borderBottomWidth: 1 },
  profileImgContainer: { padding: 4, borderRadius: 55, borderWidth: 2, marginBottom: 12 },
  profileImg: { width: 100, height: 100, borderRadius: 50 },
  profileImgFallback: { justifyContent: "center", alignItems: "center" },
  profileName: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  profileFaith: { fontSize: 15, marginBottom: 8, fontWeight: "700" },
  profileBio: { fontSize: 14, textAlign: "center", marginBottom: 16, paddingHorizontal: 20, lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: 40, marginTop: 12 },
  statContainer: { alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 16, alignItems: "center", position: "relative" },
  tabText: { fontWeight: "600", fontSize: 14 },
  activeTabText: { fontWeight: "800" },
  tabIndicator: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  listContent: { paddingBottom: 120 },
  loadingContainer: { padding: 40, justifyContent: "center", alignItems: "center", gap: 16 },
  loadingText: { fontSize: 14, fontWeight: "500" },
  emptyContainer: { padding: 40, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  followerCard: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12, borderWidth: 1.5 },
  avatarFallback: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center", marginRight: 12, borderWidth: 1.5 },
  name: { fontWeight: "700", fontSize: 16, marginBottom: 2 },
  meta: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  bio: { fontSize: 13 },
  messageBtn: { padding: 10, borderRadius: 25 },
  reelRow: { gap: 12, paddingHorizontal: 12, marginTop: 12 },
  reelCard: { flex: 1, borderRadius: 12, padding: 10, borderWidth: 1 },
  reelThumbnail: { width: "100%", aspectRatio: 9 / 16, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 8, overflow: 'hidden' },
  thumbnailImage: { width: '100%', height: '100%' },
  reelOverlay: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 },
  reelCaption: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  reelStats: { flexDirection: "row", gap: 12 },
  reelStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  reelStatText: { fontSize: 11, fontWeight: "600" },
  goLiveBtn: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
    zIndex: 999,
  },
  goLiveText: {
    fontWeight: '900',
    fontSize: 14
  }
});
