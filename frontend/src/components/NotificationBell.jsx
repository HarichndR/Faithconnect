import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationBell({ count, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} style={{ padding: 6 }}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
            {count > 0 && (
                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: "#E0245E",
                        borderRadius: 10,
                        minWidth: 18,
                        height: 18,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 4,
                    }}
                >
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                        {count}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
