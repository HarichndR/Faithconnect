import React, { useState, useEffect, useContext, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { conferenceService } from "../../services/conference.service";
import { getSocket } from "../../services/socket.service";

const { width } = Dimensions.get("window");

export default function ConferenceViewerScreen({ route, navigation }) {
    const { roomId } = route.params;
    const { theme } = useContext(ThemeContext);
    const socket = getSocket();

    const [conference, setConference] = useState(null);
    const [loading, setLoading] = useState(true);
    const [streamEnded, setStreamEnded] = useState(false);
    const pc = useRef(null);

    useEffect(() => {
        loadConference();
        socket.emit("join-conference", roomId);

        // Receive signaling offer from the broadcaster
        socket.on("signal", async ({ from, signal }) => {
            if (signal.type === "offer") {
                console.log("Received offer from broadcaster:", from);
                // await handleOffer(from, signal);
            } else if (signal.candidate) {
                // await pc.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
                console.log("Received ICE candidate from broadcaster");
            }
        });

        socket.on("stream-ended", () => {
            setStreamEnded(true);
            Alert.alert("Stream Ended", "This conference has concluded.");
        });

        return () => {
            socket.emit("leave-conference", roomId);
            if (pc.current) pc.current.close();
            socket.off("signal");
            socket.off("stream-ended");
        };
    }, []);

    const loadConference = async () => {
        try {
            const res = await conferenceService.getById(roomId);
            setConference(res.data.data);
        } catch (err) {
            Alert.alert("Error", "Could not load conference details");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleOffer = async (from, offer) => {
        // pc.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        // await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
        // const answer = await pc.current.createAnswer();
        // await pc.current.setLocalDescription(answer);
        // socket.emit("signal", { to: from, from: socket.id, signal: answer });
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
            {/* Remote Stream Mock View */}
            <View style={styles.videoArea}>
                {streamEnded ? (
                    <View style={styles.endedContainer}>
                        <Ionicons name="videocam-off" size={60} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.endedText}>Conference Ended</Text>
                        <TouchableOpacity
                            style={[styles.backBtn, { backgroundColor: theme.colors.primary }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backBtnText}>Back to Feed</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.liveStreamPlaceholder}>
                        <Ionicons name="play" size={80} color="rgba(255,255,255,0.2)" />
                        <Text style={styles.placeholderText}>Connecting to leader's stream...</Text>
                    </View>
                )}
            </View>

            {/* Overlays */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Ionicons name="chevron-back" size={30} color="#fff" />
                </TouchableOpacity>
                <View style={styles.info}>
                    <Text style={styles.title}>{conference?.title}</Text>
                    <Text style={styles.leader}>with {conference?.leader?.name}</Text>
                </View>
            </View>

            <View style={styles.bottomBar}>
                <View style={[styles.chatInput, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <Text style={{ color: 'rgba(255,255,255,0.5)' }}>Say something blessed...</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="heart" size={28} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="share-social" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    videoArea: { flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
    liveStreamPlaceholder: { alignItems: 'center' },
    placeholderText: { color: 'rgba(255,255,255,0.4)', marginTop: 20 },
    endedContainer: { alignItems: 'center', padding: 20 },
    endedText: { color: '#fff', fontSize: 20, fontWeight: '800', marginVertical: 16 },
    backBtn: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 25 },
    backBtnText: { color: '#000', fontWeight: '800' },
    header: { position: 'absolute', top: 60, left: 16, right: 16, flexDirection: 'row', alignItems: 'center' },
    closeBtn: { padding: 4 },
    info: { marginLeft: 12 },
    title: { color: '#fff', fontSize: 18, fontWeight: '800' },
    leader: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
    bottomBar: {
        position: 'absolute', bottom: 40, left: 16, right: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12
    },
    chatInput: { flex: 1, height: 44, borderRadius: 22, justifyContent: 'center', paddingHorizontal: 16 },
    actions: { flexDirection: 'row', gap: 12 },
    iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }
});
