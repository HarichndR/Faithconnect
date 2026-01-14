import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api.service";
import AppHeader from "../../components/AppHeader";
import { logger } from "../../services/log.service";

export default function ExploreScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/posts/explore");
      setPosts(res.data.data || []);
    } catch (err) {
      logger.error("Failed to fetch posts", err);
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const ExploreCard = ({ post }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate("PostDetail", { postId: post._id })}
      style={{
        flex: 1,
        margin: 4,
        height: 200,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={{ width: "100%", height: "100%" }}
        />
      )}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0,0,0,0.3)",
          padding: 8,
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            color: "#fff",
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {post.author?.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 12 }}>
      <AppHeader user={user} onProfilePress={() => navigation.navigate("Profile")} />

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 8 }}>
            Could not load posts
          </Text>
          <TouchableOpacity
            onPress={fetchPosts}
            style={{ paddingHorizontal: 24, paddingVertical: 10, backgroundColor: "#1DA1F2", borderRadius: 20 }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : posts.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>No posts to explore</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={({ item }) => <ExploreCard post={item} />}
          contentContainerStyle={{ padding: 4, paddingBottom: 80 }}
        />
      )}
    </View>
  );
}
