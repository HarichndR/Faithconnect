import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from "react-native";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { uploadApi } from "../../services/api.service";
import { logger } from "../../services/log.service";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

export default function EditProfileScreen({ navigation }) {
    const { user, setUser } = useContext(AuthContext);
    const { theme, isDark } = useContext(ThemeContext);
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [faith, setFaith] = useState(user?.faith || "");
    const [profilePhoto, setProfilePhoto] = useState(null);

    const handlePhotoOption = () => {
        Alert.alert(
            "Change Profile Photo",
            "Choose an option",
            [
                { text: "Take Photo", onPress: () => capturePhoto() },
                { text: "Choose from Library", onPress: () => pickImage() },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const capturePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Denied", "We need camera permissions to take a photo.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setProfilePhoto(result.assets[0]);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Denied", "We need library permissions to select a photo.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setProfilePhoto(result.assets[0]);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("bio", bio.trim());
            formData.append("faith", faith.trim());

            if (profilePhoto) {
                const uri = Platform.OS === 'ios' ? profilePhoto.uri.replace('file://', '') : profilePhoto.uri;
                formData.append("profilePhoto", {
                    uri,
                    name: `profile_${user._id}.jpg`,
                    type: "image/jpeg",
                });
            }

            const res = await uploadApi.patch("/users/me", formData);

            setUser(res.data.data);
            Alert.alert("Success", "Profile updated successfully");
            navigation.goBack();
        } catch (err) {
            logger.error("Failed to update profile", err);
            Alert.alert("Error", err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            <StatusBar barStyle={theme.barStyle} />

            <View style={[styles.header, { borderBottomColor: theme.colors.border, paddingTop: Math.max(insets.top, 12) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={26} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                    Edit Profile
                </Text>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    style={styles.saveBtn}
                >
                    <Text style={[styles.saveBtnText, { color: loading ? theme.colors.textSecondary : theme.colors.primary }]}>
                        {loading ? "..." : "Save"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.photoSection, { borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={handlePhotoOption} style={[styles.avatarWrapper, { borderColor: theme.colors.primary }]}>
                        {profilePhoto ? (
                            <Image source={{ uri: profilePhoto.uri }} style={styles.avatar} />
                        ) : user?.profilePhoto ? (
                            <Image
                                source={{ uri: user.profilePhoto }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
                                <Ionicons name="person" size={50} color={isDark ? "#000" : "#fff"} />
                            </View>
                        )}
                        <View style={[styles.editIcon, { backgroundColor: theme.colors.primary }]}>
                            <Ionicons name="camera" size={16} color={isDark ? "#000" : "#fff"} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handlePhotoOption} style={[styles.changePhotoBtn, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.changePhotoText, { color: isDark ? "#000" : "#fff" }]}>
                            Change Photo
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    <Field
                        label="Full Name"
                        value={name}
                        onChange={setName}
                        theme={theme}
                        isDark={isDark}
                    />

                    <Field
                        label="Faith"
                        value={faith}
                        onChange={setFaith}
                        theme={theme}
                        isDark={isDark}
                    />

                    <Field
                        label="Bio"
                        value={bio}
                        onChange={setBio}
                        multiline
                        numberOfLines={4}
                        theme={theme}
                        isDark={isDark}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function Field({ label, value, onChange, theme, isDark, multiline, numberOfLines }) {
    return (
        <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChange}
                multiline={multiline}
                numberOfLines={numberOfLines}
                style={[
                    styles.input,
                    {
                        backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                        minHeight: multiline ? 100 : 50,
                        textAlignVertical: multiline ? 'top' : 'center'
                    }
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    headerTitle: { fontSize: 18, fontWeight: "800" },
    backBtn: { padding: 4 },
    saveBtn: { padding: 4 },
    saveBtnText: { fontSize: 16, fontWeight: "700" },
    scrollContent: { paddingVertical: 20 },
    photoSection: { alignItems: "center", paddingBottom: 24, borderBottomWidth: 1, marginBottom: 12 },
    avatarWrapper: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, padding: 4, marginBottom: 16, position: 'relative' },
    avatar: { width: "100%", height: "100%", borderRadius: 50 },
    avatarFallback: { justifyContent: "center", alignItems: "center" },
    editIcon: { position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
    changePhotoBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
    changePhotoText: { fontSize: 14, fontWeight: "700" },
    form: { paddingHorizontal: 20, marginTop: 10 },
    fieldContainer: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: "700", marginBottom: 8, marginLeft: 4 },
    input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 }
});
