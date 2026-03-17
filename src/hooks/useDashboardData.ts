import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardData } from '../services/dashboardApi';
import type { DashboardData, DashboardMetrics, CategoryData, TrendData } from '../types/dashboard';

// Mock data to use when webhook fails or during development
const getMockData = (): DashboardData => {
    const mockMetrics: DashboardMetrics = {
        totalRevenue: 0,
        totalCosts: 0,
        netProfit: 0,
        walletBalance: 0,
        breakEvenPoint: 'You broke even',
        profitMargin: 0,
    };

    const mockCostsByCategory: CategoryData[] = [];

    const mockRevenueTrend: TrendData[] = [];

    return {
        metrics: mockMetrics,
        costsByCategory: mockCostsByCategory,
        revenueTrend: mockRevenueTrend,
        transactions: [],
    };
};

export const useDashboardData = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const dashboardData = await fetchDashboardData();
            setData(dashboardData);
        } catch (err) {
            console.error('Dashboard data error:', err);
            // Use mock data when webhook fails
            const mockData = getMockData();
            setData(mockData);
            // Don't show error - just use mock data silently
            setError(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const refresh = useCallback(() => {
        loadData();
    }, [loadData]);

    return {
        data,
        loading,
        error,
        refresh,
    };
};
