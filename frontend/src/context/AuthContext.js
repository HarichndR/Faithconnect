import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api.service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ---------------- SET SESSION ---------------- */
    const setSession = async (data) => {
        setUser(data.user);
        setToken(data.token);
        await AsyncStorage.setItem("token", data.token);
    };

    /* ---------------- LOGOUT ---------------- */
    const logout = async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem("token");
    };

    /* ---------------- BOOTSTRAP ---------------- */
    useEffect(() => {
        const bootstrap = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("token");

                if (!storedToken) {
                    setLoading(false);
                    return;
                }

                setToken(storedToken);

                // 🔥 FETCH USER USING TOKEN
                const res = await api.get("/auth/me", {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });

                setUser(res.data.data); // must return full user
            } catch (err) {
                console.log("Auth bootstrap failed", err);
                await AsyncStorage.removeItem("token");
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                setUser,
                setSession,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
