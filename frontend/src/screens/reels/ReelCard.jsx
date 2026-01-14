import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useEffect, useRef, useState, useContext } from "react";
import ReelActions from "./ReelActions";
import { AuthContext } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../services/api.service";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function ReelCard({ reel, isActive, containerHeight, inTab }) {
    const videoRef = useRef(null);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [paused, setPaused] = useState(false);
    const [status, setStatus] = useState({});

    // Attempt to get Tab Bar height safely
    let tabBarHeight = 0;
    try {
        tabBarHeight = useBottomTabBarHeight();
    } catch (e) {
        tabBarHeight = 0;
    }

    // Follow logic
    const { user } = useContext(AuthContext);
    const [following, setFollowing] = useState(false);

    useEffect(() => {
        if (user?.following?.some(f => f === reel.author?._id || f._id === reel.author?._id)) {
            setFollowing(true);
        }
    }, [user, reel]);

    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive) {
            videoRef.current.playAsync();
            setPaused(false);
        } else {
            videoRef.current.pauseAsync();
            videoRef.current.setPositionAsync(0);
        }
    }, [isActive]);

    const togglePlay = async () => {
        if (!videoRef.current) return;
        if (status.isPlaying) {
            await videoRef.current.pauseAsync();
            setPaused(true);
        } else {
            await videoRef.current.playAsync();
            setPaused(false);
        }
    };

    const handleFollow = async () => {
        try {
            if (following) {
                setFollowing(false);
                await api.delete(`/leaders/${reel.author._id}/follow`);
            } else {
                setFollowing(true);
                await api.post(`/leaders/${reel.author._id}/follow`);
            }
        } catch (err) {
            console.error(err);
            setFollowing(!following); // Revert
        }
    };

    const navigateToProfile = () => {
        if (!reel.author) return;
        navigation.navigate("LeaderProfile", { leaderId: reel.author._id });
    };

    // Calculate dynamic bottom margin to bridge the gap over the Navbar
    const dynamicBottom = inTab ? (tabBarHeight + 20) : (insets.bottom + 20);
    const dynamicTop = insets.top + 20;

    return (
        <View style={[styles.container, { height: containerHeight }]}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={togglePlay}
                style={styles.videoWrapper}
            >
                <Video
                    ref={videoRef}
                    source={{ uri: reel.videoUrl }}
                    style={styles.video}
                    resizeMode={ResizeMode.COVER}
                    isLooping
                    shouldPlay={isActive}
                    onPlaybackStatusUpdate={status => setStatus(() => status)}
                    posterSource={{ uri: reel.thumbnailUrl }}
                    usePoster
                    posterStyle={{ resizeMode: 'cover', height: '100%', width: '100%' }}
                />

                {paused && (
                    <View style={styles.pauseOverlay}>
                        <Ionicons name="play" size={60} color="rgba(255,255,255,0.7)" />
                    </View>
                )}
            </TouchableOpacity>

            <View style={[styles.overlay, { bottom: dynamicBottom }]}>
                <View style={styles.meta}>
                    <TouchableOpacity
                        style={styles.authorRow}
                        onPress={navigateToProfile}
                        activeOpacity={0.7}
                    >
                        {reel.author?.profilePhoto ? (
                            <Image
                                source={{ uri: reel.author.profilePhoto }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarFallback]}>
                                <Ionicons name="person" size={16} color="#fff" />
                            </View>
                        )}
                        <View>
                            <Text style={styles.author}>{reel.author?.name}</Text>
                            <Text style={styles.faith}>{reel.author?.faith || 'Faith Member'}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.actionRowInline}>
                        {user?._id !== reel.author?._id && (
                            <TouchableOpacity
                                onPress={handleFollow}
                                style={[styles.followBtn, following && styles.followingBtn]}
                            >
                                <Text style={[styles.followText, following && styles.followingText]}>
                                    {following ? "Following" : "Follow"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {reel.caption && (
                        <Text style={styles.caption} numberOfLines={3}>
                            {reel.caption}
                        </Text>
                    )}
                </View>

                <ReelActions reel={reel} />
            </View>

            {/* Top Shadow Gradient Mock for status bar area visibility */}
            <View style={[styles.topGradient, { height: dynamicTop }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: width,
        backgroundColor: "#000",
        position: 'relative',
    },
    videoWrapper: {
        width: "100%",
        height: "100%",
    },
    video: {
        width: "100%",
        height: "100%",
        position: 'absolute',
        top: 0,
        left: 0,
    },
    pauseOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)'
    },
    overlay: {
        position: "absolute",
        left: 12,
        right: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.3)', // Subtle shadow for top area
    },
    meta: {
        flex: 1,
        marginRight: 20,
        justifyContent: 'flex-end',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionRowInline: {
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    avatarFallback: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    author: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
    },
    faith: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 11,
        fontWeight: "700",
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    followBtn: {
        alignSelf: 'flex-start',
        borderWidth: 1.5,
        borderColor: "#fff",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    followingBtn: {
        borderColor: "transparent",
        backgroundColor: "rgba(255,255,255,0.25)",
    },
    followText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 12,
    },
    followingText: {
        opacity: 0.9,
    },
    caption: {
        color: "#fff",
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.9)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 10
    },
});
