// Dashboard Data Types
export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    description?: string;
}

export interface CategoryData {
    category: string;
    amount: number;
    percentage: number;
    color: string;
}

export interface TrendData {
    date: string;
    revenue: number;
    profit: number;
}

export interface DashboardMetrics {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    walletBalance: number;
    breakEvenPoint: string;
    profitMargin: number;
}

export interface DashboardData {
    metrics: DashboardMetrics;
    costsByCategory: CategoryData[];
    revenueTrend: TrendData[];
    transactions: Transaction[];
}

export interface WebhookResponse {
    transactions?: Transaction[];
    wallet?: number;
    [key: string]: any;
}
