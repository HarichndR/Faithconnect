import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getSocket, initSocket } from '../services/socket.service';
import { AuthContext } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (user?._id) {
            const socket = getSocket() || initSocket(user._id);

            socket.on('notification', (notif) => {
                setNotifications((prev) => [notif, ...prev]);

                // Basic In-App Alert for now
                Alert.alert(notif.title, notif.message);
            });

            return () => {
                socket.off('notification');
            };
        }
    }, [user?._id]);

    return (
        <NotificationContext.Provider value={{ notifications, setNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
