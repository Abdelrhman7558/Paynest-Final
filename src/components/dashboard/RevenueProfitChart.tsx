import React from 'react';
import { MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import type { TrendData } from '../../types/dashboard';
import { formatCurrency } from '../../services/dashboardApi';

interface RevenueProfitChartProps {
    data: TrendData[];
}

export const RevenueProfitChart: React.FC<RevenueProfitChartProps> = ({ data }) => {
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

    // Empty state matching reference design exactly
    if (!data || data.length === 0) {
        return (
            <div style={cardStyle}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text.primary, margin: 0 }}>Revenue & Profit Trend</h3>
                        <p style={{ fontSize: '12px', color: theme.text.secondary, margin: 0, marginTop: '4px' }}>
                            Track how your revenue and profit evolve over time.
                        </p>
                    </div>
                    <button
                        style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '6px' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bg.hover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <MoreVertical size={18} color={theme.text.muted} />
                    </button>
                </div>

                {/* Empty Grid State */}
                <div style={{ position: 'relative', height: '280px' }}>
                    {/* Y-axis labels */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        width: '24px',
                        fontSize: '12px',
                        color: theme.text.muted
                    }}>
                        <span>4</span>
                        <span>3</span>
                        <span>2</span>
                        <span>1</span>
                    </div>

                    {/* Grid area */}
                    <div style={{ marginLeft: '32px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                            {[...Array(28)].map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        height: '48px',
                                        backgroundColor: theme.bg.hover,
                                        borderRadius: '8px',
                                        border: `1px solid ${theme.border.subtle}`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* X-axis labels */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '16px',
                            fontSize: '12px',
                            color: theme.text.muted,
                            padding: '0 8px'
                        }}>
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={cardStyle}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text.primary, margin: 0 }}>Revenue & Profit Trend</h3>
                    <p style={{ fontSize: '12px', color: theme.text.secondary, margin: 0, marginTop: '4px' }}>
                        Track how your revenue and profit evolve over time.
                    </p>
                </div>
                <button
                    style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '6px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bg.hover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <MoreVertical size={18} color={theme.text.muted} />
                </button>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.border.primary} />
                    <XAxis
                        dataKey="date"
                        stroke={theme.text.muted}
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis
                        stroke={theme.text.muted}
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                        formatter={(value: any) => formatCurrency(Number(value || 0))}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
                        wrapperStyle={{ paddingTop: '16px' }}
                        formatter={(value) => <span style={{ fontSize: '13px', color: theme.text.secondary }}>{value}</span>}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={theme.status.profit}
                        strokeWidth={2.5}
                        dot={{ fill: theme.status.profit, r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Revenue"
                        isAnimationActive={true}
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                    />
                    <Line
                        type="monotone"
                        dataKey="profit"
                        stroke={theme.status.info}
                        strokeWidth={2.5}
                        dot={{ fill: theme.status.info, r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Profit"
                        isAnimationActive={true}
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
