import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    Modal,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "../services/api.service";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationDropdown({ visible, onClose, navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) fetchNotifications();
    }, [visible]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get("/notifications");
            setNotifications(res.data.data || []);
        } catch { }
        finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id, data) => {
        await api.post(`/notifications/${id}/read`);
        onClose();

        if (data?.postId) {
            navigation.navigate("PostDetail", { postId: data.postId });
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            {/* BACKDROP */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.4)",
                }}
            />

            {/* DROPDOWN */}
            <View
                style={{
                    position: "absolute",
                    top: 60,
                    right: 12,
                    width: "92%",
                    maxHeight: "70%",
                    backgroundColor: "#fff",
                    borderRadius: 14,
                    paddingVertical: 8,
                    elevation: 10,
                }}
            >
                {/* HEADER */}
                <View
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderColor: "#eee",
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: "700" }}>
                        Notifications
                    </Text>
                    <Ionicons name="close" size={20} onPress={onClose} />
                </View>

                {/* LIST */}
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => markAsRead(item._id, item.data)}
                            style={{
                                flexDirection: "row",
                                padding: 14,
                                backgroundColor: item.isRead ? "#fff" : "#f5f9ff",
                                borderBottomWidth: 1,
                                borderColor: "#f0f0f0",
                            }}
                        >
                            {item.sender?.profilePhoto ? (
                                <Image
                                    source={{ uri: item.sender.profilePhoto }}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        marginRight: 12,
                                    }}
                                />
                            ) : (
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: "#1DA1F2",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginRight: 12,
                                    }}
                                >
                                    <Ionicons name="person" size={18} color="#fff" />
                                </View>
                            )}

                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: "700", fontSize: 13 }}>
                                    {item.title}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: "#657786",
                                        marginTop: 2,
                                    }}
                                >
                                    {item.message}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={{ padding: 30, alignItems: "center" }}>
                            <Text style={{ color: "#657786" }}>
                                No notifications yet
                            </Text>
                        </View>
                    }
                />
            </View>
        </Modal>
    );
}
