import React, { createContext, useContext, useState } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';

export type Currency = 'EGP' | 'USD';

interface DashboardContextType {
    workspaceId: string;
    currency: Currency;
    setCurrency: (c: Currency) => void;
    dateRange: { start: Date; end: Date };
    setDateRange: (range: { start: Date; end: Date }) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [workspaceId] = useState('workspace_1'); // Default for now
    const [currency, setCurrency] = useState<Currency>('EGP');
    const [dateRange, setDateRange] = useState({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });

    return (
        <DashboardContext.Provider value={{ workspaceId, currency, setCurrency, dateRange, setDateRange }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
    return context;
};
