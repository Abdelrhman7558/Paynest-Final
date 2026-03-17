import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Finance-grade Dark Mode Color System
export const darkTheme = {
    // Core Colors
    bg: {
        app: '#0B132B',
        sidebar: '#0F172A',
        card: '#111827',
        hover: '#1F2937',
    },
    // Borders
    border: {
        primary: '#1F2933',
        subtle: '#374151',
    },
    // Text
    text: {
        primary: '#E5E7EB',
        secondary: '#9CA3AF',
        muted: '#6B7280',
    },
    // Accent
    accent: {
        primary: '#0F766E',
        secondary: '#84CC16',
    },
    // Status
    status: {
        profit: '#22C55E',
        cost: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
    },
};

export const lightTheme = {
    // Core Colors
    bg: {
        app: '#F1F5F9',
        sidebar: '#FFFFFF',
        card: '#FFFFFF',
        hover: '#F8FAFC',
    },
    // Borders
    border: {
        primary: '#E2E8F0',
        subtle: '#F1F5F9',
    },
    // Text
    text: {
        primary: '#0F172A',
        secondary: '#64748B',
        muted: '#94A3B8',
    },
    // Accent
    accent: {
        primary: '#0F766E',
        secondary: '#84CC16',
    },
    // Status
    status: {
        profit: '#22C55E',
        cost: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
    },
};

type Theme = typeof lightTheme;
type ThemeMode = 'Light' | 'Dark';

interface ThemeContextType {
    mode: ThemeMode;
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('theme-mode');
        return (saved === 'Dark' || saved === 'Light') ? saved : 'Light';
    });

    const theme = mode === 'Dark' ? darkTheme : lightTheme;

    const toggleTheme = () => {
        setMode((prev) => (prev === 'Light' ? 'Dark' : 'Light'));
    };

    useEffect(() => {
        localStorage.setItem('theme-mode', mode);
        // Update document for global dark mode class if needed
        document.documentElement.setAttribute('data-theme', mode.toLowerCase());
    }, [mode]);

    return (
        <ThemeContext.Provider value={{ mode, theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
