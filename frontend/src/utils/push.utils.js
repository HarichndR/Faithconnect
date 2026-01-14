import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import logger from "./logger.util";

export const registerForPushNotifications = async () => {
    try {
        if (Platform.OS === "web") return null;

        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            logger.warn("Push permission denied by user");
            return null;
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        return token;
    } catch (error) {
        logger.error("Push registration failed", { error });
        return null;
    }
};
