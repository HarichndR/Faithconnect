import React, { useState, useEffect, useContext, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { conferenceService } from "../../services/conference.service";
import { getSocket } from "../../services/socket.service";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';

const { width } = Dimensions.get("window");

export default function LiveStreamScreen({ route, navigation }) {
    const { roomId, title } = route.params;
    const { theme, isDark } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const socket = getSocket();

    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();

    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewers, setViewers] = useState(0);

    const peerConnections = useRef({});

    useEffect(() => {
        (async () => {
            const camStatus = await requestCameraPermission();
            const micStatus = await requestMicPermission();

            if (!camStatus.granted || !micStatus.granted) {
                Alert.alert("Permission", "Camera and Microphone access are required to stream.");
                navigation.goBack();
                return;
            }
            setLoading(false);
        })();

        socket.emit("join-conference", roomId);

        socket.on("viewer-joined", ({ socketId }) => {
            setViewers(prev => prev + 1);
            if (isLive) {
                // Signaling logic here
                console.log("Viewer joined while live:", socketId);
            }
        });

        socket.on("signal", ({ from, signal }) => {
            // WebRTC logic handles signal here
            console.log("Received signal from:", from);
        });

        return () => {
            socket.emit("end-stream", roomId);
            conferenceService.updateStatus(roomId, "ended").catch(console.error);
            socket.off("viewer-joined");
            socket.off("signal");
        };
    }, []);

    const handleGoLive = async () => {
        try {
            setLoading(true);
            await conferenceService.updateStatus(roomId, "live");
            setIsLive(true);
        } catch (err) {
            Alert.alert("Error", "Failed to start live stream");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: '#000', justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: '#000' }]}>
            {/* Real Camera Preview for Expo Go */}
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="front"
                mode="video"
            >
                {/* Overlays */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.streamTitle}>{title}</Text>
                        {isLive && (
                            <View style={styles.liveBadge}>
                                <Text style={styles.liveText}>LIVE</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.viewerCount}>
                        <Ionicons name="people" size={18} color="#fff" />
                        <Text style={styles.viewerText}>{viewers}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    {!isLive ? (
                        <TouchableOpacity
                            style={[styles.bigBtn, { backgroundColor: theme.colors.primary }]}
                            onPress={handleGoLive}
                            disabled={loading}
                        >
                            <Text style={styles.btnText}>START BROADCAST</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.bigBtn, { backgroundColor: '#EF4444' }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.btnText}>END STREAM</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        position: 'absolute', top: 60, left: 0, right: 0,
        paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
    },
    closeBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 25 },
    headerInfo: { flex: 1, marginLeft: 16 },
    streamTitle: { color: '#fff', fontSize: 18, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
    liveBadge: { backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, width: 40, marginTop: 4 },
    liveText: { color: '#fff', fontSize: 10, fontWeight: '900', textAlign: 'center' },
    viewerCount: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 12 },
    viewerText: { color: '#fff', fontWeight: '800' },
    footer: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' },
    bigBtn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, elevation: 5 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '900' }
});
