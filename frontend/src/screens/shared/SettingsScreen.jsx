import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from "react-native";
import { useState, useContext, useEffect } from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { logger } from "../../services/log.service";
import { ThemeContext } from "../../context/ThemeContext";
import { NotificationService } from "../../services/notification.service";
import { AuthContext } from "../../context/AuthContext";

export default function SettingsScreen({ navigation }) {
    const { theme, isDark, toggleTheme } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);

    const [notifications, setNotifications] = useState(user?.deviceTokens?.length > 0);
    const [loadingNotif, setLoadingNotif] = useState(false);
    const [privateAccount, setPrivateAccount] = useState(false);

    const handleNotifToggle = async (value) => {
        if (value) {
            setLoadingNotif(true);
            try {
                const success = await NotificationService.registerToken();
                if (success) {
                    setNotifications(true);
                    Alert.alert("Success", "Notifications enabled successfully!");
                } else {
                    Alert.alert("Error", "Could not enable notifications. Please check your system settings.");
                }
            } catch (err) {
                logger.error("Failed to enable notifications", err);
            } finally {
                setLoadingNotif(false);
            }
        } else {
            // Logic to disable could go here (e.g. DELETE /me/device-token)
            setNotifications(false);
            Alert.alert("Notifications", "Push notifications disabled on this device.");
        }
    };

    const SettingItem = ({ icon, label, value, onToggle, hasToggle, loading }) => (
        <View style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
        }}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} />
                <Text style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: theme.colors.text,
                    marginLeft: 12,
                    flex: 1,
                }}>
                    {label}
                </Text>
            </View>
            {hasToggle ? (
                loading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                    <Switch
                        value={value}
                        onValueChange={onToggle}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                        thumbColor={value ? theme.colors.primary : "#f4f3f4"}
                    />
                )
            ) : (
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            )}
        </View>
    );

    const SectionHeader = ({ title }) => (
        <Text style={{
            fontSize: 12,
            fontWeight: "700",
            color: theme.colors.textSecondary,
            textTransform: "uppercase",
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: isDark ? "#111" : "#f8f9fa",
        }}>
            {title}
        </Text>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginTop: 40,
                borderBottomColor: theme.colors.border,
                borderBottomWidth: 1,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.card,
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700", color: theme.colors.text }}>
                    Settings
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
                {/* Privacy Settings */}
                <SectionHeader title="Privacy & Security" />
                <SettingItem
                    icon="lock"
                    label="Private Account"
                    value={privateAccount}
                    onToggle={() => setPrivateAccount(!privateAccount)}
                    hasToggle={true}
                />
                <TouchableOpacity
                    onPress={() => Alert.alert("Password Change", "Password change feature coming soon")}
                    style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottomColor: theme.colors.border,
                        borderBottomWidth: 1,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <MaterialCommunityIcons name="key" size={20} color={theme.colors.primary} />
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: theme.colors.text,
                            marginLeft: 12,
                        }}>
                            Change Password
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                {/* Notification Settings */}
                <SectionHeader title="Notifications" />
                <SettingItem
                    icon="bell"
                    label="Enable Notifications"
                    value={notifications}
                    onToggle={handleNotifToggle}
                    hasToggle={true}
                    loading={loadingNotif}
                />

                {/* Display Settings */}
                <SectionHeader title="Display" />
                <SettingItem
                    icon="moon"
                    label="Dark Mode"
                    value={isDark}
                    onToggle={toggleTheme}
                    hasToggle={true}
                />

                {/* About */}
                <SectionHeader title="About" />
                <TouchableOpacity
                    onPress={() => Alert.alert("About", "FaithConnect v1.0.0")}
                    style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottomColor: theme.colors.border,
                        borderBottomWidth: 1,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <MaterialCommunityIcons name="information" size={20} color={theme.colors.primary} />
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: theme.colors.text,
                            marginLeft: 12,
                        }}>
                            About FaithConnect
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => Alert.alert("Terms", "Terms & Conditions coming soon")}
                    style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottomColor: theme.colors.border,
                        borderBottomWidth: 1,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <MaterialCommunityIcons name="file-document" size={20} color={theme.colors.primary} />
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: theme.colors.text,
                            marginLeft: 12,
                        }}>
                            Terms & Conditions
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
