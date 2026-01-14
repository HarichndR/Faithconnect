import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { chatService } from "../../services/chat.service";
import { api } from "../../services/api.service";
import { ThemeContext } from "../../context/ThemeContext";

/* ---------------- HELPER ---------------- */
const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  if (diff < 86400000 && now.getDate() === date.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.getDate() === date.getDate()) {
    return "Yesterday";
  }

  return date.toLocaleDateString();
};

export default function ChatListScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user } = useContext(AuthContext);
  const { theme, isDark } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState("Messages"); // 'Messages' | 'Contacts'
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, activeTab]);

  const loadData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);

      if (activeTab === "Messages") {
        const res = await chatService.getChats();
        setChats(res.data.data || []);
      } else {
        const res = await api.get("/users/chat-candidates");
        setContacts(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const openChat = (chatId, otherUser) => {
    navigation.navigate("Chat", {
      chatId,
      otherUser, // Fallback if chat details need fetching
      recipientId: otherUser?._id,
      recipientName: otherUser?.name,
      recipientPhoto: otherUser?.profilePhoto
    });
  };

  const handleContactPress = async (contact) => {
    try {
      setLoading(true);
      const res = await chatService.createOrGetChat(contact._id);
      const chat = res.data.data;

      navigation.navigate("Chat", {
        chatId: chat._id,
        otherUser: contact, // Pass full contact object for header
      });
    } catch (err) {
      console.error("Failed to start chat", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RENDER ITEM ---------------- */
  const renderChat = ({ item }) => {
    const otherUser = item.participants.find((p) => p._id !== user._id) || {};
    const unread = item.unreadCount || 0;

    // Last Message Logic
    const lastMsgContent = item.lastMessage?.content || "No messages yet";
    const lastMsgTime = item.lastMessage?.createdAt || item.updatedAt;

    return (
      <TouchableOpacity
        style={[styles.card, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background }]}
        onPress={() => openChat(item._id, otherUser)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {otherUser.profilePhoto ? (
            <Image source={{ uri: otherUser.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{otherUser.name || "Unknown User"}</Text>
            <Text style={[styles.time, { color: theme.colors.textSecondary }]}>{formatTime(lastMsgTime)}</Text>
          </View>
          <View style={styles.row}>
            <Text
              numberOfLines={1}
              style={[styles.lastMsg, { color: theme.colors.textSecondary }, unread > 0 && [styles.lastMsgBold, { color: theme.colors.text }]]}
            >
              {lastMsgContent}
            </Text>
            {unread > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.badgeText}>{unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContact = ({ item }) => (
    <View style={[styles.card, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
      <View style={styles.avatarContainer}>
        {item.profilePhoto ? (
          <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.role, { color: theme.colors.textSecondary }]}>{item.role === 'leader' ? 'Leader' : 'Follower'}</Text>
      </View>

      <TouchableOpacity
        style={[styles.messageBtn, { backgroundColor: theme.colors.primary }]}
        onPress={() => handleContactPress(item)}
      >
        <Text style={styles.messageBtnText}>Message</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Messages</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Messages" && [styles.activeTab, { borderBottomColor: theme.colors.primary }]]}
          onPress={() => setActiveTab("Messages")}
        >
          <Text style={[styles.tabText, { color: theme.colors.textSecondary }, activeTab === "Messages" && [styles.activeTabText, { color: theme.colors.primary }]]}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Contacts" && [styles.activeTab, { borderBottomColor: theme.colors.primary }]]}
          onPress={() => setActiveTab("Contacts")}
        >
          <Text style={[styles.tabText, { color: theme.colors.textSecondary }, activeTab === "Contacts" && [styles.activeTabText, { color: theme.colors.primary }]]}>
            {user?.role === 'leader' ? 'Followers' : 'Leaders'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={activeTab === "Messages" ? chats : contacts}
          keyExtractor={item => item._id}
          renderItem={activeTab === "Messages" ? renderChat : renderContact}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {activeTab === "Messages" ? "No active chats" : "No contacts found"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "800", color: "#1F2937" },
  tabs: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 10 },
  tab: { marginRight: 20, paddingBottom: 8 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#8B5CF6" },
  tabText: { fontSize: 16, color: "#9CA3AF", fontWeight: "600" },
  activeTabText: { color: "#8B5CF6", fontWeight: "700" },
  list: { paddingBottom: 100 },
  card: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  avatarContainer: { marginRight: 15 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarFallback: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#E9D5FF", justifyContent: "center", alignItems: "center" },
  info: { flex: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  name: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  time: { fontSize: 12, color: "#9CA3AF" },
  lastMsg: { fontSize: 14, color: "#6B7280", flex: 1 },
  lastMsgBold: { color: "#1F2937", fontWeight: "700" },
  badge: { backgroundColor: "#8B5CF6", paddingHorizontal: 6, borderRadius: 10, height: 20, justifyContent: "center" },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  role: { fontSize: 12, color: "#6B7280" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 50 },
  emptyText: { color: "#9CA3AF", fontSize: 16 },
  messageBtn: { backgroundColor: "#8B5CF6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  messageBtnText: { color: "#fff", fontWeight: "600", fontSize: 12 }
});
