import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemeProvider } from "./src/context/ThemeContext";
import { NotificationProvider } from "./src/context/NotificationContext";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}


