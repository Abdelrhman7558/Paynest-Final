import React from 'react';
import { DollarSign, TrendingDown, TrendingUp, Wallet, Target, Percent } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { DashboardMetrics } from '../../types/dashboard';


interface KPIGridProps {
    metrics: DashboardMetrics | null;
    loading?: boolean;
}

import { KPICard } from './KPICard';

export const KPIGrid: React.FC<KPIGridProps> = ({ metrics, loading = false }) => {
    const { theme, mode } = useTheme();

    // Loading skeleton
    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            backgroundColor: theme.bg.card,
                            borderRadius: '16px',
                            padding: '24px',
                            borderLeft: `4px solid ${theme.border.primary}`,
                            boxShadow: mode === 'Dark' ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
                            minHeight: '110px',
                        }}
                        className="animate-pulse"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ width: '100px', height: '16px', backgroundColor: theme.bg.hover, borderRadius: '4px', marginBottom: '16px' }}></div>
                                <div style={{ width: '70px', height: '24px', backgroundColor: theme.bg.hover, borderRadius: '4px' }}></div>
                            </div>
                            <div style={{ width: '48px', height: '48px', backgroundColor: theme.bg.hover, borderRadius: '14px' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Default metrics when null
    const displayMetrics: DashboardMetrics = metrics || {
        totalRevenue: 0,
        totalCosts: 0,
        netProfit: 0,
        walletBalance: 0,
        breakEvenPoint: 'You broke even',
        profitMargin: 0,
    };

    // Determine break-even text based on profit
    const getBreakEvenText = () => {
        if (displayMetrics.netProfit > 0) return "You're operating profitably";
        if (displayMetrics.netProfit < 0) return "Amount remaining to break even";
        return "You've reached break-even";
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {/* Row 1 */}
            <KPICard
                title="Total Revenue"
                value={displayMetrics.totalRevenue}
                icon={<DollarSign size={22} strokeWidth={2.5} />}
                iconBgColor="#DCFCE7"
                iconBgColorDark="rgba(34, 197, 94, 0.2)"
                iconColor="#22C55E"
                tooltip="All income generated across your connected sales channels."
                isCurrency
            />

            <KPICard
                title="Total Costs"
                value={displayMetrics.totalCosts}
                icon={<TrendingDown size={22} strokeWidth={2.5} />}
                iconBgColor="#FEE2E2"
                iconBgColorDark="rgba(239, 68, 68, 0.2)"
                iconColor="#EF4444"
                tooltip="All operational, marketing, shipping, and overhead expenses."
                isCurrency
            />

            <KPICard
                title="Net Profit"
                value={displayMetrics.netProfit}
                icon={<TrendingUp size={22} strokeWidth={2.5} />}
                iconBgColor="#DBEAFE"
                iconBgColorDark="rgba(59, 130, 246, 0.2)"
                iconColor="#3B82F6"
                tooltip="Your actual earnings after all costs are deducted."
                isCurrency
            />

            {/* Row 2 */}
            <KPICard
                title="Wallet Balance"
                value={displayMetrics.walletBalance}
                icon={<Wallet size={22} strokeWidth={2.5} />}
                iconBgColor="#F3E8FF"
                iconBgColorDark="rgba(168, 85, 247, 0.2)"
                iconColor="#A855F7"
                tooltip="Available cash across connected wallets and accounts."
                isCurrency
            />

            <KPICard
                title="Break-Even Point"
                value={getBreakEvenText()}
                icon={<Target size={22} strokeWidth={2.5} />}
                iconBgColor="#FEF3C7"
                iconBgColorDark="rgba(245, 158, 11, 0.2)"
                iconColor="#F59E0B"
                tooltip="The point where your total revenue equals total costs."
            />

            <KPICard
                title="Profit Margin"
                value={displayMetrics.profitMargin}
                icon={<Percent size={22} strokeWidth={2.5} />}
                iconBgColor="#ECFCCB"
                iconBgColorDark="rgba(132, 204, 22, 0.2)"
                iconColor="#84CC16"
                tooltip="The percentage of revenue you keep as profit."
                isPercentage
            />
        </div>
    );
};
