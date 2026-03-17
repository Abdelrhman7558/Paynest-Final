import React from 'react';
import { MoreVertical } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import type { CategoryData } from '../../types/dashboard';
import { formatCurrency } from '../../services/dashboardApi';

interface CostsByCategoryChartProps {
    data: CategoryData[];
}

export const CostsByCategoryChart: React.FC<CostsByCategoryChartProps> = ({ data }) => {
    const { theme, mode } = useTheme();

    const cardStyle = {
        backgroundColor: theme.bg.card,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: mode === 'Dark'
            ? '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
            : '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
        height: '100%',
        minHeight: '380px',
        transition: 'all 0.3s ease',
    };

    // Empty state matching reference design
    if (!data || data.length === 0) {
        return (
            <div style={cardStyle}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text.primary, margin: 0 }}>Costs by Category</h3>
                    <button
                        style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '6px' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bg.hover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <MoreVertical size={18} color={theme.text.muted} />
                    </button>
                </div>

                {/* Empty State - Professional UX Copy */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 600, color: theme.text.primary, margin: 0, marginBottom: '8px' }}>
                        No cost data available
                    </p>
                    <p style={{ fontSize: '14px', color: theme.text.secondary, margin: 0, textAlign: 'center' }}>
                        Add or sync expenses to see a detailed cost breakdown.
                    </p>
                </div>
            </div>
        );
    }

    // Calculate percentage for each category
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const dataWithPercentage = data.map(item => ({
        ...item,
        percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
    }));

    return (
        <div style={cardStyle}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text.primary, margin: 0 }}>Costs by Category</h3>
                <button
                    style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '6px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bg.hover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <MoreVertical size={18} color={theme.text.muted} />
                </button>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={dataWithPercentage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => {
                            const { name, percentage } = props;
                            return `${name} ${percentage?.toFixed(0)}%`;
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                    >
                        {dataWithPercentage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) => formatCurrency(Number(value || 0))}
                        contentStyle={{
                            backgroundColor: theme.bg.card,
                            border: `1px solid ${theme.border.primary}`,
                            borderRadius: '10px',
                            padding: '10px 14px',
                            boxShadow: mode === 'Dark' ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
                            color: theme.text.primary,
                        }}
                        labelStyle={{ color: theme.text.secondary }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string) => (
                            <span style={{ fontSize: '13px', color: theme.text.secondary }}>{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
