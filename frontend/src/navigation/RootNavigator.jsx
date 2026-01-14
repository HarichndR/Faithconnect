import React, { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

/* =======================
   IMPORT NAVIGATORS
======================= */
import MainNavigator from "./MainNavigator";
import AuthNavigator from "./AuthNavigator";

/* =======================
   IMPORT SCREENS
======================= */
import ReelsFeedScreen from "../screens/reels/ReelsFeedScreen";
import ChatListScreen from "../screens/shared/ChatListScreen";
import ChatScreen from "../screens/shared/ChatScreen";

import PostDetailScreen from "../screens/shared/PostDetailScreen";
import SavedPostsScreen from "../screens/shared/SavedPostsScreen";
import LikedPostsScreen from "../screens/shared/LikedPostsScreen";
import LeaderProfileScreen from "../screens/worshiper/LeaderProfileScreen";

import FollowersListScreen from "../screens/shared/FollowersListScreen";
import FollowingListScreen from "../screens/shared/FollowingListScreen";
import EditProfileScreen from "../screens/shared/EditProfileScreen";

import SettingsScreen from "../screens/shared/SettingsScreen";
import HelpScreen from "../screens/shared/HelpScreen";
import LiveStreamScreen from "../screens/leader/LiveStreamScreen";
import ConferenceViewerScreen from "../screens/worshiper/ConferenceViewerScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { token, loading } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          {/* MAIN BOTTOM / TAB NAVIGATOR */}
          <Stack.Screen name="Main" component={MainNavigator} />

          {/* EXTRA SCREENS ABOVE TAB */}
          <Stack.Group
            screenOptions={{
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="SavedPosts" component={SavedPostsScreen} />
            <Stack.Screen name="LikedPosts" component={LikedPostsScreen} />
            <Stack.Screen name="LeaderProfile" component={LeaderProfileScreen} />

            <Stack.Screen name="FollowersList" component={FollowersListScreen} />
            <Stack.Screen name="FollowingList" component={FollowingListScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />

            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />

            {/* ✅ REELS */}
            <Stack.Screen name="ReelsFeed" component={ReelsFeedScreen} />

            {/* ✅ CHAT */}
            <Stack.Screen name="Chats" component={ChatListScreen} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: false,
              }}
            />

            {/* ✅ CONFERENCES */}
            <Stack.Screen name="LiveStream" component={LiveStreamScreen} />
            <Stack.Screen name="ConferenceViewer" component={ConferenceViewerScreen} />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
