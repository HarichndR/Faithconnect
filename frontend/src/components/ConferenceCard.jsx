import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

export default function ConferenceCard({ conference, onPress }) {
    const { theme, isDark } = useContext(ThemeContext);
    const isLive = conference.status === "live";

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.thumbnailContainer}>
                {conference.thumbnailUrl ? (
                    <Image source={{ uri: conference.thumbnailUrl }} style={styles.thumbnail} />
                ) : (
                    <View style={[styles.thumbnailFallback, { backgroundColor: isDark ? '#1a1a1a' : '#f3f4f6' }]}>
                        <Ionicons name="videocam" size={40} color={theme.colors.primary} />
                    </View>
                )}
                {isLive && (
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                )}
                {!isLive && (
                    <View style={styles.upcomingBadge}>
                        <Text style={styles.upcomingText}>UPCOMING</Text>
                    </View>
                )}
            </View>

            <View style={styles.info}>
                <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
                    {conference.title}
                </Text>
                <Text style={[styles.leaderName, { color: theme.colors.textSecondary }]}>
                    by {conference.leader?.name || "Leader"} • {conference.leader?.faith}
                </Text>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {conference.description || "Join this spiritual conference for enlightenment and prayer."}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.stat}>
                        <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                            {conference.viewers?.length || 0} watching
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.joinBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={onPress}
                    >
                        <Text style={[styles.joinBtnText, { color: isDark ? "#000" : "#fff" }]}>
                            {isLive ? "Join Now" : "Register"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        borderBottomWidth: 1,
        paddingBottom: 16,
    },
    thumbnailContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    thumbnailFallback: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    liveBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#EF4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
    },
    liveText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
    upcomingBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    upcomingText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
    info: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    leaderName: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
        fontWeight: '500',
    },
    joinBtn: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    joinBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
});
