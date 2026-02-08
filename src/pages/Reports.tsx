import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { getMockDrillDownData } from '../utils/mockReportsData';
import { KPISummaryGrid } from '../components/reports/KPISummaryGrid';
import { DrillDownPanel } from '../components/reports/DrillDownPanel';
import type { ReportKPI, MetricDrillDown } from '../types/reports';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, Percent, Wallet,
    Download, ChevronDown, Sparkles,
    Send,
    BarChart3, PieChart, Bot, AlertTriangle,
    CheckCircle, Info, Loader2
} from 'lucide-react';

// ================== TYPES ==================

interface KPIData {
    title: string;
    value: string;
    change: number;
    changeLabel: string;
    tooltip: string;
    icon: string | React.ReactNode;
}

interface ChartDataPoint {
    month: string;
    revenue: number;
    costs: number;
    profit: number;
}

interface InsightItem {
    id: string;
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    source: string;
    confidence: number;
}

// ================== SAMPLE DATA ==================

const sampleChartData: ChartDataPoint[] = [
    { month: 'Jan', revenue: 45000, costs: 32000, profit: 13000 },
    { month: 'Feb', revenue: 52000, costs: 35000, profit: 17000 },
    { month: 'Mar', revenue: 48000, costs: 33000, profit: 15000 },
    { month: 'Apr', revenue: 61000, costs: 38000, profit: 23000 },
    { month: 'May', revenue: 55000, costs: 36000, profit: 19000 },
    { month: 'Jun', revenue: 67000, costs: 41000, profit: 26000 },
];

const sampleKPIs: KPIData[] = [
    {
        title: 'Net Revenue',
        value: 'EGP 328,000',
        change: 12.5,
        changeLabel: 'vs last period',
        tooltip: 'Total revenue after returns and discounts',
        icon: <DollarSign size={20} />,
    },
    {
        title: 'Net Profit',
        value: 'EGP 113,000',
        change: 8.3,
        changeLabel: 'vs last period',
        tooltip: 'Revenue minus all costs and expenses',
        icon: <Wallet size={20} />,
    },
    {
        title: 'Gross Margin',
        value: '34.5%',
        change: 2.1,
        changeLabel: 'vs last period',
        tooltip: '(Revenue - Cost of Goods) / Revenue × 100',
        icon: <Percent size={20} />,
    },
    {
        title: 'Total Costs',
        value: 'EGP 215,000',
        change: -5.2,
        changeLabel: 'vs last period',
        tooltip: 'All operational and product costs combined',
        icon: <TrendingDown size={20} />,
    },
];

const sampleInsights: InsightItem[] = [
    {
        id: '1',
        type: 'success',
        title: 'Profit Margin Improved',
        description: 'Your profit margin increased by 2.1% this month, primarily due to reduced shipping costs and better supplier negotiations.',
        source: 'Costs & Revenue Analysis',
        confidence: 94,
    },
    {
        id: '2',
        type: 'warning',
        title: 'Inventory Holding Costs Rising',
        description: 'Slow-moving SKUs are increasing storage costs. Consider running promotions on items stagnant for 60+ days.',
        source: 'Inventory Analysis',
        confidence: 87,
    },
    {
        id: '3',
        type: 'info',
        title: 'Ad Spend Efficiency',
        description: 'Your ROAS improved to 3.2x this month. Meta ads are outperforming Google by 40%.',
        source: 'Ads Performance',
        confidence: 91,
    },
];

const revenueBreakdown = [
    { category: 'Product Sales', amount: 245000, percentage: 74.7 },
    { category: 'Services', amount: 52000, percentage: 15.9 },
    { category: 'Subscriptions', amount: 31000, percentage: 9.4 },
];

const costBreakdown = [
    { category: 'Product Costs', amount: 125000, percentage: 58.1 },
    { category: 'Marketing', amount: 45000, percentage: 20.9 },
    { category: 'Operations', amount: 28000, percentage: 13.0 },
    { category: 'Overhead', amount: 17000, percentage: 8.0 },
];

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const getIcon = (iconName: string): React.ReactNode => {
    switch (iconName) {
        case 'DollarSign': return <DollarSign size={20} />;
        case 'Wallet': return <Wallet size={20} />;
        case 'Percent': return <Percent size={20} />;
        case 'TrendingDown': return <TrendingDown size={20} />;
        case 'TrendingUp': return <TrendingUp size={20} />;
        case 'BarChart3': return <BarChart3 size={20} />;
        case 'PieChart': return <PieChart size={20} />;
        default: return <DollarSign size={20} />;
    }
};

// ================== HELPER FUNCTIONS ==================

// Helper function removed


// fetchAllData removed as we now trigger report generation via webhook only.

// KPICard component removed as it is replaced by KPISummaryGrid

// ================== CHART SECTION ==================

const ChartSection: React.FC<{
    theme: any;
    data: ChartDataPoint[];
}> = ({ theme, data }) => {
    const [chartType, setChartType] = useState<'area' | 'bar'>('area');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                backgroundColor: theme.bg.card,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: 16,
                padding: 24,
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                        Revenue vs Costs
                    </h3>
                    <p style={{ fontSize: 13, color: theme.text.muted, margin: '4px 0 0' }}>
                        Monthly comparison
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={() => setChartType('area')}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: `1px solid ${chartType === 'area' ? theme.accent.primary : theme.border.primary}`,
                            backgroundColor: chartType === 'area' ? theme.accent.primary : 'transparent',
                            color: chartType === 'area' ? 'white' : theme.text.secondary,
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        <BarChart3 size={14} />
                        Area
                    </button>
                    <button
                        onClick={() => setChartType('bar')}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: `1px solid ${chartType === 'bar' ? theme.accent.primary : theme.border.primary}`,
                            backgroundColor: chartType === 'bar' ? theme.accent.primary : 'transparent',
                            color: chartType === 'bar' ? 'white' : theme.text.secondary,
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        <PieChart size={14} />
                        Bar
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.border.subtle} />
                            <XAxis dataKey="month" stroke={theme.text.muted} fontSize={12} />
                            <YAxis stroke={theme.text.muted} fontSize={12} tickFormatter={(v) => `${v / 1000}K`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.bg.card,
                                    border: `1px solid ${theme.border.primary}`,
                                    borderRadius: 8,
                                }}
                                formatter={(value) => value !== undefined ? formatCurrency(value as number) : ''}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#colorRevenue)" name="Revenue" />
                            <Area type="monotone" dataKey="costs" stroke="#EF4444" fill="url(#colorCosts)" name="Costs" />
                        </AreaChart>
                    ) : (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.border.subtle} />
                            <XAxis dataKey="month" stroke={theme.text.muted} fontSize={12} />
                            <YAxis stroke={theme.text.muted} fontSize={12} tickFormatter={(v) => `${v / 1000}K`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.bg.card,
                                    border: `1px solid ${theme.border.primary}`,
                                    borderRadius: 8,
                                }}
                                formatter={(value) => value !== undefined ? formatCurrency(value as number) : ''}
                            />
                            <Legend />
                            <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="costs" fill="#EF4444" name="Costs" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

// ================== PROFIT TREND CHART ==================

const ProfitTrendChart: React.FC<{
    theme: any;
    data: ChartDataPoint[];
}> = ({ theme, data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
                backgroundColor: theme.bg.card,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: 16,
                padding: 24,
            }}
        >
            <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                    Net Profit Trend
                </h3>
                <p style={{ fontSize: 13, color: theme.text.muted, margin: '4px 0 0' }}>
                    Monthly profit after all expenses
                </p>
            </div>

            <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.border.subtle} />
                        <XAxis dataKey="month" stroke={theme.text.muted} fontSize={12} />
                        <YAxis stroke={theme.text.muted} fontSize={12} tickFormatter={(v) => `${v / 1000}K`} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme.bg.card,
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 8,
                            }}
                            formatter={(value) => value !== undefined ? formatCurrency(value as number) : ''}
                        />
                        <Line
                            type="monotone"
                            dataKey="profit"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                            name="Net Profit"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

// ================== DATA TABLE SECTION ==================

const DataTableSection: React.FC<{
    theme: any;
    revenueData: any[];
    costData: any[];
}> = ({ theme, revenueData, costData }) => {
    const [activeTab, setActiveTab] = useState<'revenue' | 'costs'>('revenue');

    const tabs = [
        { id: 'revenue', label: 'Revenue Breakdown', icon: <TrendingUp size={16} /> },
        { id: 'costs', label: 'Cost Breakdown', icon: <TrendingDown size={16} /> },
    ];

    const currentData = activeTab === 'revenue' ? revenueData : costData;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                backgroundColor: theme.bg.card,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: 16,
                overflow: 'hidden',
            }}
        >
            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: `1px solid ${theme.border.primary}`,
                padding: '0 24px',
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'revenue' | 'costs')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '16px 20px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: activeTab === tab.id ? theme.accent.primary : theme.text.secondary,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer',
                            borderBottom: activeTab === tab.id ? `2px solid ${theme.accent.primary}` : '2px solid transparent',
                            marginBottom: -1,
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                <button
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 16px',
                        margin: '12px 0',
                        border: `1px solid ${theme.border.primary}`,
                        borderRadius: 8,
                        backgroundColor: 'transparent',
                        color: theme.text.secondary,
                        fontSize: 13,
                        cursor: 'pointer',
                    }}
                >
                    <Download size={14} />
                    Export
                </button>
            </div>

            {/* Table */}
            <div style={{ padding: 24 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{
                                textAlign: 'left',
                                padding: '12px 16px',
                                fontSize: 12,
                                fontWeight: 600,
                                color: theme.text.muted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                borderBottom: `1px solid ${theme.border.subtle}`,
                            }}>
                                Category
                            </th>
                            <th style={{
                                textAlign: 'right',
                                padding: '12px 16px',
                                fontSize: 12,
                                fontWeight: 600,
                                color: theme.text.muted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                borderBottom: `1px solid ${theme.border.subtle}`,
                            }}>
                                Amount
                            </th>
                            <th style={{
                                textAlign: 'right',
                                padding: '12px 16px',
                                fontSize: 12,
                                fontWeight: 600,
                                color: theme.text.muted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                borderBottom: `1px solid ${theme.border.subtle}`,
                            }}>
                                Percentage
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((row, index) => (
                            <tr key={index}>
                                <td style={{
                                    padding: '16px',
                                    fontSize: 14,
                                    color: theme.text.primary,
                                    borderBottom: `1px solid ${theme.border.subtle}`,
                                }}>
                                    {row.category}
                                </td>
                                <td style={{
                                    textAlign: 'right',
                                    padding: '16px',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: theme.text.primary,
                                    borderBottom: `1px solid ${theme.border.subtle}`,
                                }}>
                                    {formatCurrency(row.amount)}
                                </td>
                                <td style={{
                                    textAlign: 'right',
                                    padding: '16px',
                                    fontSize: 14,
                                    color: theme.text.secondary,
                                    borderBottom: `1px solid ${theme.border.subtle}`,
                                }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                    }}>
                                        <div style={{
                                            width: 60,
                                            height: 6,
                                            backgroundColor: theme.bg.hover,
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                width: `${row.percentage}%`,
                                                height: '100%',
                                                backgroundColor: activeTab === 'revenue' ? '#10B981' : '#EF4444',
                                                borderRadius: 3,
                                            }} />
                                        </div>
                                        {row.percentage}%
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

// ================== AI INSIGHTS PANEL ==================

const AIInsightsPanel: React.FC<{
    theme: any;
    insights: InsightItem[];
}> = ({ theme, insights }) => {
    const [question, setQuestion] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const getInsightIcon = (type: InsightItem['type']) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} color="#10B981" />;
            case 'warning': return <AlertTriangle size={18} color="#F59E0B" />;
            case 'info': return <Info size={18} color="#3B82F6" />;
        }
    };

    const getInsightBg = (type: InsightItem['type']) => {
        switch (type) {
            case 'success': return 'rgba(16, 185, 129, 0.08)';
            case 'warning': return 'rgba(245, 158, 11, 0.08)';
            case 'info': return 'rgba(59, 130, 246, 0.08)';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                backgroundColor: theme.bg.card,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: 16,
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 20,
                    cursor: 'pointer',
                    borderBottom: isExpanded ? `1px solid ${theme.border.primary}` : 'none',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Sparkles size={20} color="white" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                            Finance Agent Insights
                        </h3>
                        <p style={{ fontSize: 12, color: theme.text.muted, margin: '2px 0 0' }}>
                            AI-powered analysis of your data
                        </p>
                    </div>
                </div>
                <ChevronDown
                    size={20}
                    style={{
                        color: theme.text.muted,
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s ease',
                    }}
                />
            </div>

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        {/* Insights List */}
                        <div style={{ padding: 20 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {insights.map((insight) => (
                                    <div
                                        key={insight.id}
                                        style={{
                                            padding: 16,
                                            borderRadius: 12,
                                            backgroundColor: getInsightBg(insight.type),
                                            border: `1px solid ${theme.border.subtle}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            {getInsightIcon(insight.type)}
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: theme.text.primary,
                                                    margin: '0 0 6px',
                                                }}>
                                                    {insight.title}
                                                </h4>
                                                <p style={{
                                                    fontSize: 13,
                                                    color: theme.text.secondary,
                                                    margin: '0 0 10px',
                                                    lineHeight: 1.5,
                                                }}>
                                                    {insight.description}
                                                </p>
                                                <div style={{
                                                    display: 'flex',
                                                    gap: 12,
                                                    fontSize: 11,
                                                    color: theme.text.muted,
                                                }}>
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 4,
                                                        padding: '2px 8px',
                                                        backgroundColor: theme.bg.hover,
                                                        borderRadius: 4,
                                                    }}>
                                                        <Bot size={12} />
                                                        {insight.source}
                                                    </span>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        backgroundColor: theme.bg.hover,
                                                        borderRadius: 4,
                                                    }}>
                                                        {insight.confidence}% confidence
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ask Agent */}
                        <div style={{
                            padding: 20,
                            borderTop: `1px solid ${theme.border.primary}`,
                            backgroundColor: theme.bg.hover,
                        }}>
                            <p style={{
                                fontSize: 12,
                                color: theme.text.muted,
                                margin: '0 0 10px',
                            }}>
                                Ask the Finance Agent
                            </p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="e.g., Why did profit drop last week?"
                                    style={{
                                        flex: 1,
                                        padding: '10px 14px',
                                        border: `1px solid ${theme.border.primary}`,
                                        borderRadius: 10,
                                        backgroundColor: theme.bg.card,
                                        color: theme.text.primary,
                                        fontSize: 14,
                                        outline: 'none',
                                    }}
                                />
                                <button
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 10,
                                        backgroundColor: theme.accent.primary,
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Send size={18} color="white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ================== MAIN REPORTS PAGE ==================

export const Reports: React.FC = () => {
    const { theme } = useTheme();
    const { user, session } = useAuth(); // Importing useAuth
    const [dateRange, setDateRange] = useState('last30');
    const [loading, setLoading] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState('Initializing...');
    const [error, setError] = useState<string | null>(null);

    // Data States
    const [kpis, setKpis] = useState<KPIData[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [breakdown, setBreakdown] = useState<{ revenue: any[], costs: any[] }>({ revenue: [], costs: [] });
    const [insights, setInsights] = useState<InsightItem[]>([]);

    // Drill Down State
    const [selectedDrillDown, setSelectedDrillDown] = useState<MetricDrillDown | null>(null);
    const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);

    // Debug State (Removed as we no longer fetch data on client)
    // const [showDebug, setShowDebug] = useState(false);
    // const [debugInfo, setDebugInfo] = useState<{...} | null>(null);

    const handleKpiClick = (kpiId: string) => {
        const metricIdRaw = kpiId.split('-')[0].toLowerCase();
        // Use helper to get mock drill-down data
        const drillData = getMockDrillDownData(metricIdRaw);
        setSelectedDrillDown(drillData);
        setIsDrillDownOpen(true);
    };

    // Map existing KPI structure to new component structure
    const mappedKpis: ReportKPI[] = kpis.map((k, index) => ({
        id: k.title.toLowerCase().replace(/\s+/g, '-'),
        title: k.title,
        value: k.value,
        change: k.change,
        changeLabel: k.changeLabel,
        trend: k.change >= 0 ? 'up' : 'down',
        // Map common titles to icon names or pass through if string
        icon: typeof k.icon === 'string' ? k.icon : ['revenue', 'profit', 'margin', 'costs'][index] || 'bar-chart'
    }));

    const dateRanges = [
        { value: 'last7', label: 'Last 7 days' },
        { value: 'last30', label: 'Last 30 days' },
        { value: 'last90', label: 'Last 90 days' },
        { value: 'thisYear', label: 'This year' },
    ];

    useEffect(() => {
        // Define userId at component level so it can be used in useEffect dependencies
        const userId = user?.id || session?.user?.id;

        const initReport = async () => {
            console.log('👤 Reports Page - Current User ID:', userId);

            if (!userId) {
                console.log('⚠️ No user ID found, stopping report generation.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                setLoadingStatus('Generating AI Report...');

                console.log('� Sending Trigger to Reports Webhook...');

                // TRIGGER ONLY: Sends user_id to n8n, which handles data fetching server-side
                const reportResponse = await fetch('https://n8n.srv1181726.hstgr.cloud/webhook-test/reports', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        report_date: new Date().toISOString()
                    })
                });

                const reportData = await reportResponse.json();
                console.log('📊 Report Generated:', reportData);

                if (!reportData || (!reportData.kpiCards && !reportData.data)) {
                    throw new Error('Invalid report format received');
                }

                setLoadingStatus('Finalizing...');

                // Update State with Report Data
                setKpis((reportData.kpiCards || []).map((k: any) => ({
                    ...k,
                    icon: getIcon(k.icon)
                })));

                // Chart Data Handling
                const combinedChartData = [];
                if (reportData.revenueChart) combinedChartData.push(...reportData.revenueChart);
                if (reportData.expenseChart) combinedChartData.push(...reportData.expenseChart);
                if (reportData.profitChart) combinedChartData.push(...reportData.profitChart);
                setChartData(combinedChartData.length > 0 ? combinedChartData : (reportData.chartData || []));

                setBreakdown({
                    revenue: reportData.revenueBreakdown || [],
                    costs: reportData.costBreakdown || []
                });
                setInsights(reportData.insights || []);
                setLoadingStatus('Report generation complete!');
                setLoading(false);

            } catch (err: any) {
                console.error('❌ Report Generation Failed:', err);
                setLoadingStatus('Failed to generate report.');
                setLoading(false);
            }
        };

        if (userId) {
            initReport();
        }
    }, [user, session]);

    return (
        <DashboardLayout>
            <div style={{ backgroundColor: theme.bg.app, minHeight: '100vh' }}>
                {/* Header */}
                <div style={{
                    backgroundColor: theme.bg.card,
                    borderBottom: `1px solid ${theme.border.primary}`,
                    padding: '20px 32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                            Reports & Intelligence
                        </h1>
                        <p style={{ fontSize: 13, color: theme.text.secondary, margin: '4px 0 0' }}>
                            Your complete financial overview powered by AI
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {/* Debuggers removed */}
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            style={{
                                padding: '10px 16px',
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 10,
                                backgroundColor: theme.bg.card,
                                color: theme.text.primary,
                                fontSize: 14,
                                cursor: 'pointer',
                            }}
                        >
                            {dateRanges.map((range) => (
                                <option key={range.value} value={range.value}>
                                    {range.label}
                                </option>
                            ))}
                        </select>
                        <button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 20px',
                                backgroundColor: theme.accent.primary,
                                color: 'white',
                                border: 'none',
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            <Download size={16} />
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: 32 }}>

                    {/* Debug Panel Removed */}
                    {/* KPI Grid */}
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '16px' }}>
                            <Loader2 size={40} className="animate-spin" color={theme.accent.primary} />
                            <p style={{ color: theme.text.secondary, fontSize: '14px', fontWeight: 500 }}>{loadingStatus}</p>
                        </div>
                    ) : error ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#EF4444' }}>
                            {error}
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 24 }}>
                                <KPISummaryGrid
                                    kpis={mappedKpis}
                                    onKpiClick={handleKpiClick}
                                    isLoading={loading}
                                />
                            </div>

                            {/* Charts Row */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 24,
                                marginBottom: 24,
                            }}>
                                <ChartSection theme={theme} data={chartData} />
                                <ProfitTrendChart theme={theme} data={chartData} />
                            </div>

                            {/* Tables & AI Panel Row */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr',
                                gap: 24,
                            }}>
                                <DataTableSection theme={theme} revenueData={breakdown.revenue} costData={breakdown.costs} />
                                <AIInsightsPanel theme={theme} insights={insights} />
                            </div>
                        </>
                    )}
                </div>
                <DrillDownPanel
                    isOpen={isDrillDownOpen}
                    onClose={() => setIsDrillDownOpen(false)}
                    metric={selectedDrillDown}
                />
            </div>
        </DashboardLayout>
    );
};
