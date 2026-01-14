import {
    View,
    Text,
    FlatList,
    Dimensions,
    ActivityIndicator,
    StyleSheet,
    Platform,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import { useEffect, useRef, useState, useContext } from "react";
import { reelService } from "../../services/reel.service";
import ReelCard from "./ReelCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { useIsFocused } from "@react-navigation/native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ReelsFeedScreen({ route, navigation }) {
    const { initialReels, initialIndex } = route?.params || {};
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const { theme } = useContext(ThemeContext);

    // Attempt to get Tab Bar height safely
    let tabBarHeight = 0;
    try {
        tabBarHeight = useBottomTabBarHeight();
    } catch (e) {
        tabBarHeight = 0;
    }

    // "Very Perfectly" calculate the viewable area
    const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT - tabBarHeight);

    const [reels, setReels] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);

    useEffect(() => {
        loadReels();
    }, []);

    const loadReels = async (isRefreshing = false) => {
        try {
            if (initialReels && initialReels.length > 0 && !isRefreshing) {
                setReels(initialReels);
                setActiveIndex(initialIndex || 0);
                setHasMore(false);
                setTimeout(() => setLoading(false), 100);
                return;
            }

            if (!isRefreshing) setLoading(true);

            const currentOffset = isRefreshing ? 0 : offset;
            const res = await reelService.explore({ limit: 10, offset: currentOffset });
            const newReels = res?.data?.data || [];

            if (isRefreshing) {
                setReels(newReels);
                setOffset(10);
            } else {
                setReels(newReels);
                setOffset(10);
            }

            setHasMore(newReels.length >= 10);

        } catch {
            if (isRefreshing) setReels([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadMoreFn = async () => {
        if (!hasMore || fetchingMore || (initialReels && initialReels.length > 0)) return;

        try {
            setFetchingMore(true);
            const res = await reelService.explore({ limit: 10, offset });
            const newReels = res?.data?.data || [];

            if (newReels.length > 0) {
                setReels(prev => [...prev, ...newReels]);
                setOffset(prev => prev + 10);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingMore(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadReels(true);
    };

    const onItemVisible = useRef(({ viewableItems }) => {
        if (viewableItems?.length > 0) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const getItemLayout = (_, index) => ({
        length: containerHeight,
        offset: containerHeight * index,
        index,
    });

    const onLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        if (height > 0) {
            setContainerHeight(height);
        }
    };

    const isStack = initialReels && initialReels.length > 0;

    /* ---------------- LOADING ---------------- */
    if (loading && !refreshing && reels.length === 0) {
        return (
            <View style={[styles.center, { height: containerHeight }]}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Loading Reels...</Text>
            </View>
        );
    }

    /* ---------------- EMPTY ---------------- */
    if (!loading && reels.length === 0) {
        return (
            <View style={[styles.center, { height: containerHeight }]}>
                <Text style={styles.emptyEmoji}>🎬</Text>
                <Text style={styles.emptyTitle}>No Reels Yet</Text>
                <Text style={styles.emptyText}>Be the first leader to share a reel!</Text>
            </View>
        );
    }

    /* ---------------- FEED ---------------- */
    return (
        <View style={styles.flexContainer} onLayout={onLayout}>
            <StatusBar barStyle="light-content" translucent />

            {/* Custom Header Padding for Top Inset if in Stack */}
            {isStack && (
                <TouchableOpacity
                    style={[styles.backButton, { top: insets.top + 10 }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
            )}

            <FlatList
                data={reels}
                keyExtractor={(item) => item._id}
                renderItem={({ item, index }) => (
                    <ReelCard
                        reel={item}
                        isActive={index === activeIndex && isFocused}
                        containerHeight={containerHeight}
                        inTab={!isStack}
                    />
                )}
                pagingEnabled
                snapToInterval={containerHeight}
                snapToAlignment="start"
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onItemVisible}
                viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
                getItemLayout={getItemLayout}
                initialScrollIndex={initialIndex || 0}
                initialNumToRender={1}
                windowSize={3}
                maxToRenderPerBatch={1}
                removeClippedSubviews={true}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                tintColor="#fff"
                onEndReached={loadMoreFn}
                onEndReachedThreshold={0.5}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: "#000",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        paddingHorizontal: 20,
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginTop: 12,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: "#aaa",
        textAlign: "center",
        lineHeight: 22,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 100,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 25,
    }
});
