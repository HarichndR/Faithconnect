import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, Alert } from "react-native";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api.service";
import AppHeader from "../../components/AppHeader";
import { logger } from "../../services/log.service";
import { Ionicons } from "@expo/vector-icons";

export default function FollowersListScreen({ route, navigation }) {
    const { userId } = route.params;
    const { user } = useContext(AuthContext);
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        fetchFollowers();
        if (user?.role === "leader") {
            fetchUnreadCounts();
        }
    }, [userId, user]);

    const fetchFollowers = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/users/${userId || "me"}`);
            setFollowers(res.data.data?.followers || []);
        } catch (err) {
            logger.error("Failed to fetch followers", err);
            setError(err.message);
            setFollowers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCounts = async () => {
        try {
            const res = await api.get("/chats/unread-counts");
            setUnreadCounts(res.data.data || {});
        } catch (err) {
            logger.error("Failed to fetch unread counts", err);
        }
    };

    const handleMessage = async (followerId) => {
        try {
            // For leaders, create/get chat with follower (worshiper)
            const res = await api.post("/chats", { userId: followerId });
            const chat = res.data.data;
            const otherUser = chat.participants.find((p) => p._id !== user._id);
            navigation.navigate("Chat", { chatId: chat._id, otherUser });
        } catch (err) {
            logger.error("Failed to create/get chat", err);
            Alert.alert("Error", err.response?.data?.message || "Failed to open chat");
        }
    };

    const FollowerItem = ({ follower }) => {
        const unreadCount = unreadCounts[follower._id] || 0;
        const showMessageButton = user?.role === "leader" && follower.role === "worshiper";

        return (
            <View
                style={{
                    backgroundColor: "#fff",
                    borderBottomColor: "#e1e8ed",
                    borderBottomWidth: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <TouchableOpacity
                    onPress={() => navigation.push("LeaderProfile", { leaderId: follower._id })}
                    activeOpacity={0.7}
                    style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                >
                    {follower.profilePhoto ? (
                        <Image
                            source={{ uri: follower.profilePhoto }}
                            style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                        />
                    ) : (
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                backgroundColor: "#1DA1F2",
                                justifyContent: "center",
                                alignItems: "center",
                                marginRight: 12,
                            }}
                        >
                            <Ionicons name="person" size={24} color="#fff" />
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: "#000" }}>
                            {follower.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#657786", marginTop: 2 }}>
                            {follower.faith}
                        </Text>
                    </View>
                </TouchableOpacity>

                {showMessageButton && (
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            handleMessage(follower._id);
                        }}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: "#1DA1F2",
                            justifyContent: "center",
                            alignItems: "center",
                            marginLeft: 12,
                            position: "relative",
                        }}
                    >
                        <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                        {unreadCount > 0 && (
                            <View
                                style={{
                                    position: "absolute",
                                    top: -2,
                                    right: -2,
                                    backgroundColor: "#E0245E",
                                    borderRadius: 10,
                                    minWidth: 20,
                                    height: 20,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    paddingHorizontal: 4,
                                }}
                            >
                                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Header */}
            <View style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomColor: "#e1e8ed",
                borderBottomWidth: 1,
                flexDirection: "row",
                alignItems: "center",
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#1DA1F2" />
                </TouchableOpacity>
                <Text style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#000" }}>
                    Followers
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#1DA1F2" />
                </View>
            ) : error ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 8 }}>
                        Could not load followers
                    </Text>
                    <TouchableOpacity
                        onPress={fetchFollowers}
                        style={{ paddingHorizontal: 24, paddingVertical: 10, backgroundColor: "#1DA1F2", borderRadius: 20 }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "600" }}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : followers.length === 0 ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
                        No followers yet
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={followers}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => <FollowerItem follower={item} />}
                    contentContainerStyle={{ paddingBottom: 80 }}
                />
            )}
        </View>
    );
}
