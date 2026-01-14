import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ROLES } from "../../constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const isLeader = user?.role === ROLES.LEADER;

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {user?.profilePhoto ? (
          <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
        )}

        <Text style={styles.name}>{user?.name || "User"}</Text>
        <Text style={styles.meta}>
          {user?.faith} • {isLeader ? "Religious Leader" : "Worshiper"}
        </Text>

        {isLeader && user?.bio ? (
          <Text style={styles.bio}>{user.bio}</Text>
        ) : null}
      </View>

      {/* LEADER STATS */}
      {isLeader && (
        <View style={styles.statsRow}>
          <StatCard label="Followers" value={user?.followersCount || 0} />
          <StatCard label="Posts" value={user?.postsCount || 0} />
          <StatCard label="Reels" value={user?.reelsCount || 0} />
        </View>
      )}

      {/* ACTIONS */}
      <View style={styles.section}>
        <ProfileAction
          icon="pencil-outline"
          label="Edit Profile"
          onPress={() => navigation.navigate("EditProfile")}
        />

        {isLeader ? (
          <>
            <ProfileAction
              icon="pencil-plus-outline"
              label="Create Post"
              onPress={() => navigation.navigate("CreatePost")}
            />
            <ProfileAction
              icon="video-outline"
              label="Create Reel"
              onPress={() => navigation.navigate("CreateReel")}
            />
            <ProfileAction
              icon="account-group-outline"
              label="My Followers"
              onPress={() => navigation.navigate("Followers")}
            />
          </>
        ) : (
          <>
            <ProfileAction
              icon="account-star-outline"
              label="My Leaders"
              onPress={() => navigation.navigate("MyLeaders")}
            />
            <ProfileAction
              icon="bookmark-outline"
              label="Saved Posts"
              onPress={() => navigation.navigate("SavedPosts")}
            />
          </>
        )}

        <ProfileAction
          icon="log-out-outline"
          label="Logout"
          danger
          onPress={confirmLogout}
        />
      </View>
    </ScrollView>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function ProfileAction({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity
      style={[styles.actionRow, danger && styles.dangerRow]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={danger ? "#B91C1C" : "#374151"}
      />
      <Text style={[styles.actionText, danger && styles.dangerText]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    backgroundColor: "#fff",
  },

  header: {
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },

  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#2E6EF7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  meta: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  bio: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  statCard: {
    alignItems: "center",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  section: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 14,
  },

  actionText: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },

  dangerRow: {
    borderBottomColor: "#FEE2E2",
  },

  dangerText: {
    color: "#B91C1C",
    fontWeight: "600",
  },
});
