import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const lightTheme = {
    dark: false,
    colors: {
        background: '#FFFFFF',
        card: '#FFFFFF',
        text: '#1F2937',        // Gray-800
        textSecondary: '#6B7280', // Gray-500
        border: '#F3F4F6',      // Gray-100
        primary: '#000000',     // Changed from Purple to Black per request
        accent: '#8B5CF6',      // Keep purple as subtle accent/fallback
        success: '#10B981',
        error: '#EF4444',
        inputBg: '#F9FAFB',
        barStyle: 'dark-content',
    }
};

export const darkTheme = {
    dark: true,
    colors: {
        background: '#000000',
        card: '#121212',
        text: '#FFFFFF',
        textSecondary: '#9CA3AF',
        border: '#1F2937',
        primary: '#FFFFFF',     // White accent on Black background for premium look
        accent: '#8B5CF6',
        success: '#10B981',
        error: '#EF4444',
        inputBg: '#1F2937',
        barStyle: 'light-content',
    }
};

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === 'dark');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const stored = await AsyncStorage.getItem('theme');
            if (stored) {
                setIsDark(stored === 'dark');
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        }
    };

    const toggleTheme = async () => {
        const newMode = !isDark;
        setIsDark(newMode);
        try {
            await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
