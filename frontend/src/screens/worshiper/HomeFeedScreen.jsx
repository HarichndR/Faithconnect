import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useContext, useEffect, useRef, useState } from "react";

import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { api } from "../../services/api.service";
import ConferenceCard from "../../components/ConferenceCard";
import AppHeader from "../../components/AppHeader";
import PostCard from "../../components/PostCard";
import { logger } from "../../services/log.service";

const TABS = ["Following", "Explore", "Conferences"];

export default function HomeFeedScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { theme, isDark } = useContext(ThemeContext);

  const [posts, setPosts] = useState([]);
  const postsCache = useRef({});
  const [activeTab, setActiveTab] = useState("Following");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [conferences, setConferences] = useState([]);

  /* ---------------- FETCH POSTS ---------------- */
  useEffect(() => {
    if (activeTab === "Conferences") {
      fetchConferences();
    } else {
      fetchPosts();
    }
  }, [activeTab]);

  const fetchPosts = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      const endpoint =
        activeTab === "Following" ? "/posts/following" : "/posts/explore";

      const res = await api.get(endpoint);
      const fetched = res.data.data || [];

      const merged = fetched.map((p) => {
        return postsCache.current[p._id] ?? p;
      });

      merged.forEach((p) => {
        postsCache.current[p._id] = p;
      });

      setPosts(merged);
    } catch (err) {
      logger.error("Fetch posts failed", err);
      setError("Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchConferences = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const { conferenceService } = require("../../services/conference.service");
      const res = await conferenceService.getAll();
      setConferences(res.data.data || []);
    } catch (err) {
      logger.error("Fetch conferences failed", err);
      setError("Failed to load conferences");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === "Conferences") {
      fetchConferences(true);
    } else {
      fetchPosts(true);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.barStyle} />
      <AppHeader user={user} />

      {/* TABS */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                { color: theme.colors.textSecondary },
                activeTab === tab && [styles.tabTextActive, { color: theme.colors.primary }]
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={[styles.tabIndicator, { backgroundColor: theme.colors.primary }]} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* FEED */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading posts...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} onPress={() => fetchPosts()}>
            <Text style={[styles.retryButtonText, { color: isDark ? '#000' : '#fff' }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === "Conferences" ? (
        <FlatList
          data={conferences}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ConferenceCard
              conference={item}
              onPress={() => navigation.navigate("ConferenceViewer", { roomId: item.roomId })}
            />
          )}
          contentContainerStyle={styles.feedContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📽️</Text>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No conferences yet</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Stay tuned for live spiritual sessions</Text>
            </View>
          }
        />
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No posts yet</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {activeTab === "Following"
              ? "Follow some leaders to see their posts here"
              : "Check back later for new content"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() =>
                navigation.navigate("PostDetail", { postId: item._id })
              }
              onPostUpdate={(updatedPost) => {
                setPosts((prev) =>
                  prev.map((p) =>
                    p._id === updatedPost._id ? updatedPost : p
                  )
                );
              }}
            />
          )}
          contentContainerStyle={styles.feedContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
  },
  tabTextActive: {
    fontWeight: "800",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  feedContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
