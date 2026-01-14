import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useContext } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../constants";
import { ThemeContext } from "../context/ThemeContext";

import HomeFeedScreen from "../screens/worshiper/HomeFeedScreen";
import ReelsFeedScreen from "../screens/reels/ReelsFeedScreen";
import DiscoverLeadersScreen from "../screens/worshiper/DiscoverLeadersScreen";

import LeaderDashboardScreen from "../screens/leader/LeaderDashboardScreen";
import CreatePostScreen from "../screens/leader/CreatePostScreen";
import CreateReelScreen from "../screens/reels/CreateReelScreen";

import ChatListScreen from "../screens/shared/ChatListScreen";
import ProfileScreen from "../screens/shared/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { user } = useContext(AuthContext);
  const { theme, isDark } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const role = user?.role;

  /* ---------------- COMMON TAB STYLE ---------------- */

  const tabScreenOptions = {
    headerShown: false,
    tabBarShowLabel: true,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textSecondary,
    tabBarStyle: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: (Platform.OS === "ios" ? 85 : 70) + (insets.bottom > 0 ? insets.bottom / 2 : 0),
      paddingBottom: (Platform.OS === "ios" ? 30 : 12) + (insets.bottom > 0 ? insets.bottom / 2 : 0),
      paddingTop: 10,
      backgroundColor: theme.colors.card,
      borderTopColor: theme.colors.border,
      borderTopWidth: 1,
      elevation: 20,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: -10 },
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: "800",
      marginTop: 4,
    },
    tabBarIconStyle: {
      marginTop: 2,
    },
  };

  /* ==================================================
     LEADER TABS (CREATION-FIRST)
     ================================================== */

  if (role === ROLES.LEADER) {
    return (
      <Tab.Navigator screenOptions={tabScreenOptions}>
        <Tab.Screen
          name="Dashboard"
          component={LeaderDashboardScreen}
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />

        <Tab.Screen
          name="CreatePost"
          component={CreatePostScreen}
          options={{
            title: "Post",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "pencil-plus" : "pencil-outline"}
                color={color}
                size={28}
              />
            ),
          }}
        />

        <Tab.Screen
          name="CreateReel"
          component={CreateReelScreen}
          options={{
            title: "Reels",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "video-plus" : "video-outline"}
                color={color}
                size={28}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Messages"
          component={ChatListScreen}
          options={{
            title: "Messages",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  /* ==================================================
     WORSHIPER TABS (CONTENT-FIRST)
     ================================================== */

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeFeedScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Explore"
        component={ReelsFeedScreen}
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "play-circle" : "play-circle-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Leaders"
        component={DiscoverLeadersScreen}
        options={{
          title: "Leaders",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "account-star" : "account-star-outline"}
              color={color}
              size={28}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={ChatListScreen}
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
