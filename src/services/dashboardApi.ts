import type { WebhookResponse, DashboardData, DashboardMetrics, CategoryData, TrendData } from '../types/dashboard';

const WEBHOOK_URL = 'https://n8n.srv1181726.hstgr.cloud/webhook-test/masarefy-all';

// Fetch dashboard data from webhook
export const fetchDashboardData = async (): Promise<DashboardData> => {
    try {
        const response = await fetch(WEBHOOK_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData: WebhookResponse = await response.json();
        return processDashboardData(rawData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};

// Process raw webhook data into dashboard metrics
const processDashboardData = (rawData: WebhookResponse): DashboardData => {
    const transactions = rawData.transactions || [];

    // Calculate metrics
    const totalRevenue = calculateTotalRevenue(transactions);
    const totalCosts = calculateTotalCosts(transactions);
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const walletBalance = rawData.wallet || 0;
    const breakEvenPoint = getBreakEvenStatus(netProfit);

    const metrics: DashboardMetrics = {
        totalRevenue,
        totalCosts,
        netProfit,
        walletBalance,
        breakEvenPoint,
        profitMargin,
    };

    const costsByCategory = groupCostsByCategory(transactions);
    const revenueTrend = calculateRevenueTrend(transactions);

    return {
        metrics,
        costsByCategory,
        revenueTrend,
        transactions,
    };
};

// Calculate total revenue from transactions
const calculateTotalRevenue = (transactions: any[]): number => {
    return transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
};

// Calculate total costs from transactions
const calculateTotalCosts = (transactions: any[]): number => {
    return transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
};

// Get break-even status message
const getBreakEvenStatus = (netProfit: number): string => {
    if (netProfit === 0) return 'You broke even';
    if (netProfit > 0) return 'Reached';
    return `EGP ${Math.abs(netProfit).toFixed(2)} remaining`;
};

// Group costs by category
const groupCostsByCategory = (transactions: any[]): CategoryData[] => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);

    const categoryMap = new Map<string, number>();

    expenses.forEach((t) => {
        const category = t.category || 'Other';
        categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount);
    });

    const colors = ['#EF4444', '#F59E0B', '#84CC16', '#3B82F6', '#8B5CF6', '#EC4899'];
    let colorIndex = 0;

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: colors[colorIndex++ % colors.length],
    }));
};

// Calculate revenue and profit trend over time
const calculateRevenueTrend = (transactions: any[]): TrendData[] => {
    const dateMap = new Map<string, { revenue: number; costs: number }>();

    transactions.forEach((t) => {
        const date = t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const current = dateMap.get(date) || { revenue: 0, costs: 0 };

        if (t.type === 'income') {
            current.revenue += t.amount || 0;
        } else if (t.type === 'expense') {
            current.costs += t.amount || 0;
        }

        dateMap.set(date, current);
    });

    return Array.from(dateMap.entries())
        .map(([date, { revenue, costs }]) => ({
            date,
            revenue,
            profit: revenue - costs,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Format currency
export const formatCurrency = (amount: number): string => {
    return `EGP ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Format percentage
export const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
};
