export interface ReportKPI {
    id: string;
    title: string;
    value: string | number;
    change: number; // Percentage change
    changeLabel: string; // e.g. "vs last 30 days"
    trend: 'up' | 'down' | 'neutral';
    icon?: string; // Icon name from Lucide
    description?: string; // Tooltip or short desc
}

export interface MetricDrillDown {
    metricId: string;
    explanation: string;
    formula: string;
    sources: string[];
    history: { date: string; value: number }[];
    breakdown: { label: string; value: number; percentage: number }[];
    aiInsight: {
        type: 'success' | 'warning' | 'info';
        text: string;
    };
}
