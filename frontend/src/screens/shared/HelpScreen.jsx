import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function HelpScreen({ navigation }) {
    const faqs = [
        {
            id: 1,
            question: "How do I create a post?",
            answer: "If you're a leader, go to the 'Create' tab and select 'Create Post'. Choose an image, add your caption, and publish!",
        },
        {
            id: 2,
            question: "How do I follow a leader?",
            answer: "Go to the 'Discover Leaders' tab, find a leader, and tap the 'Follow' button.",
        },
        {
            id: 3,
            question: "Can I save posts?",
            answer: "Yes! Tap the bookmark icon on any post to save it. View saved posts in your profile menu.",
        },
        {
            id: 4,
            question: "How do I message someone?",
            answer: "Go to the 'Chat' tab, find the person you want to message, and start typing!",
        },
        {
            id: 5,
            question: "How do I edit my profile?",
            answer: "Go to your Profile tab, tap 'Edit Profile', and update your information.",
        },
    ];

    const HelpItem = ({ item }) => (
        <View style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomColor: "#e1e8ed",
            borderBottomWidth: 1,
        }}>
            <Text style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#1DA1F2",
                marginBottom: 6,
            }}>
                Q: {item.question}
            </Text>
            <Text style={{
                fontSize: 13,
                color: "#657786",
                lineHeight: 20,
            }}>
                A: {item.answer}
            </Text>
        </View>
    );

    const ContactItem = ({ icon, label, action, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottomColor: "#e1e8ed",
                borderBottomWidth: 1,
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <MaterialCommunityIcons name={icon} size={20} color="#1DA1F2" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: "#000",
                    }}>
                        {label}
                    </Text>
                    <Text style={{
                        fontSize: 12,
                        color: "#657786",
                        marginTop: 2,
                    }}>
                        {action}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#657786" />
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
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
                    Help & Support
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
                {/* Contact Section */}
                <View style={{
                    paddingVertical: 16,
                    borderBottomColor: "#e1e8ed",
                    borderBottomWidth: 1,
                }}>
                    <Text style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#657786",
                        textTransform: "uppercase",
                        paddingHorizontal: 16,
                        marginBottom: 8,
                    }}>
                        Contact Us
                    </Text>
                    <ContactItem
                        icon="email"
                        label="Email Support"
                        action="support@faithconnect.app"
                        onPress={() => Linking.openURL("mailto:support@faithconnect.app")}
                    />
                    <ContactItem
                        icon="phone"
                        label="Call Us"
                        action="+1 (555) 123-4567"
                        onPress={() => Linking.openURL("tel:+15551234567")}
                    />
                </View>

                {/* FAQs Section */}
                <View>
                    <Text style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#657786",
                        textTransform: "uppercase",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        backgroundColor: "#f8f9fa",
                    }}>
                        Frequently Asked Questions
                    </Text>
                    {faqs.map((item) => (
                        <HelpItem key={item.id} item={item} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
