import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    StatusBar,
} from "react-native";
import { useEffect, useState, useContext } from "react";
import { postService } from "../../services/post.service";
import { reelService } from "../../services/reel.service";
import { ThemeContext } from "../../context/ThemeContext";
import PostCard from "../../components/PostCard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = width / 2 - 12;

export default function LikedPostsScreen({ navigation }) {
    const { theme, isDark } = useContext(ThemeContext);
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState("posts"); // "posts" or "reels"
    const [posts, setPosts] = useState([]);
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [postsRes, reelsRes] = await Promise.all([
                postService.getLiked(),
                reelService.getLiked()
            ]);
            setPosts(postsRes.data.data || []);
            setReels(reelsRes.data.data || []);
        } catch (err) {
            console.error("Failed to load liked content", err);
        } finally {
            setLoading(false);
        }
    };

    const renderPost = ({ item }) => (
        <PostCard
            post={item}
            onPress={() => navigation.navigate("PostDetail", { postId: item._id })}
            onPostUpdate={(updated) => {
                setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
            }}
        />
    );

    const renderReel = ({ item }) => (
        <TouchableOpacity
            style={styles.reelCard}
            onPress={() => navigation.navigate("ReelsFeed", { initialReels: [item], initialIndex: 0 })}
        >
            <Image
                source={{ uri: item.thumbnailUrl || item.videoUrl }}
                style={styles.reelThumb}
            />
            <View style={styles.reelOverlay}>
                <Ionicons name="heart" size={20} color="#EF4444" />
                <Text style={styles.reelLikes}>{item.likes?.length || 0}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
                style={[styles.tab, activeTab === "posts" && { borderBottomColor: theme.colors.primary }]}
                onPress={() => setActiveTab("posts")}
            >
                <MaterialCommunityIcons
                    name={activeTab === "posts" ? "heart" : "heart-outline"}
                    size={24}
                    color={activeTab === "posts" ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text style={[styles.tabText, { color: activeTab === "posts" ? theme.colors.text : theme.colors.textSecondary }]}>Posts</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === "reels" && { borderBottomColor: theme.colors.primary }]}
                onPress={() => setActiveTab("reels")}
            >
                <MaterialCommunityIcons
                    name={activeTab === "reels" ? "movie-filter" : "movie-play-outline"}
                    size={24}
                    color={activeTab === "reels" ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text style={[styles.tabText, { color: activeTab === "reels" ? theme.colors.text : theme.colors.textSecondary }]}>Reels</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.barStyle} />
            <View style={{ paddingTop: insets.top }}>
                <View style={styles.screenHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Liked</Text>
                    <View style={{ width: 24 }} />
                </View>
            </View>

            {renderHeader()}

            {activeTab === "posts" ? (
                <FlatList
                    key="liked-posts-list"
                    data={posts}
                    keyExtractor={i => i._id}
                    renderItem={renderPost}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="heart-outline" size={64} color={theme.colors.border} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No liked posts</Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    key="liked-reels-grid"
                    data={reels}
                    keyExtractor={i => i._id}
                    renderItem={renderReel}
                    numColumns={2}
                    contentContainerStyle={styles.gridContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="film-outline" size={64} color={theme.colors.border} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No liked reels</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    screenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', flexDirection: 'row', justifyContent: 'center', gap: 8 },
    tabText: { fontWeight: '700', fontSize: 14 },
    reelCard: { width: COLUMN_WIDTH, height: COLUMN_WIDTH * 1.5, margin: 6, borderRadius: 12, overflow: 'hidden', backgroundColor: '#333' },
    reelThumb: { width: '100%', height: '100%' },
    reelOverlay: { position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
    reelLikes: { color: '#fff', fontSize: 12, fontWeight: '700' },
    gridContent: { padding: 6, paddingBottom: 100 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 12 },
    emptyText: { fontSize: 16, fontWeight: '600' }
});
