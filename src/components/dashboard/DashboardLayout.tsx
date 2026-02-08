import React from 'react';
import { Sidebar } from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { theme } = useTheme();

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: theme.bg.app,
                transition: 'background-color 0.3s ease',
            }}
        >
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div
                style={{
                    marginLeft: '260px',
                    minHeight: '100vh',
                }}
            >
                {children}
            </div>
        </div>
    );
};
