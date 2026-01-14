import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api.service";
import AppHeader from "../../components/AppHeader";
import { logger } from "../../services/log.service";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationsScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/notifications");
            setNotifications(res.data.data || []);
        } catch (err) {
            logger.error("Failed to fetch notifications", err);
            setError(err.message);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const NotificationItem = ({ notification }) => {
        const getIcon = () => {
            switch (notification.type) {
                case "follow":
                    return "person-add";
                case "like":
                    return "heart";
                case "comment":
                    return "chatbubble";
                case "message":
                    return "mail";
                default:
                    return "notifications";
            }
        };

        return (
            <TouchableOpacity
                onPress={() => {
                    if (notification.data?.postId) {
                        navigation.navigate("PostDetail", { postId: notification.data.postId });
                    } else if (notification.data?.userId) {
                        navigation.navigate("LeaderProfile", { leaderId: notification.data.userId });
                    }
                }}
                activeOpacity={0.7}
                style={{
                    backgroundColor: notification.read ? "#fff" : "#f8f9fa",
                    borderBottomColor: "#e1e8ed",
                    borderBottomWidth: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                {notification.from?.profilePhoto ? (
                    <Image
                        source={{ uri: notification.from.profilePhoto }}
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            marginRight: 12,
                        }}
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
                        <Ionicons name={getIcon()} size={24} color="#fff" />
                    </View>
                )}

                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: notification.read ? "500" : "700",
                            color: "#000",
                        }}
                    >
                        {notification.message}
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            color: "#657786",
                            marginTop: 4,
                        }}
                    >
                        {new Date(notification.createdAt).toLocaleDateString()}
                    </Text>
                </View>

                {!notification.read && (
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#1DA1F2",
                            marginLeft: 8,
                        }}
                    />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <AppHeader user={user} onProfilePress={() => navigation.navigate("Profile")} />

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#1DA1F2" />
                </View>
            ) : error ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 8 }}>
                        Could not load notifications
                    </Text>
                    <TouchableOpacity
                        onPress={fetchNotifications}
                        style={{ paddingHorizontal: 24, paddingVertical: 10, backgroundColor: "#1DA1F2", borderRadius: 20 }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "600" }}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : notifications.length === 0 ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>No notifications</Text>
                    <Text style={{ fontSize: 12, color: "#657786", marginTop: 8 }}>When someone interacts with you, you'll see it here</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => <NotificationItem notification={item} />}
                    contentContainerStyle={{ paddingBottom: 80 }}
                />
            )}
        </View>
    );
}
