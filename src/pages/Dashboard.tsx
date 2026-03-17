import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { CostsByCategoryChart } from '../components/dashboard/CostsByCategoryChart';
import { RevenueProfitChart } from '../components/dashboard/RevenueProfitChart';
import { useDashboardData } from '../hooks/useDashboardData';
import { useTheme } from '../context/ThemeContext';

export const Dashboard: React.FC = () => {
    const { data, loading, error, refresh } = useDashboardData();
    const { theme, mode } = useTheme();

    return (
        <DashboardLayout>
            {/* Header */}
            <DashboardHeader onRefresh={refresh} isLoading={loading} />

            {/* Main Content */}
            <div
                style={{
                    backgroundColor: theme.bg.app,
                    padding: '24px 32px',
                    minHeight: 'calc(100vh - 90px)',
                    transition: 'background-color 0.3s ease',
                }}
            >
                {/* Error State */}
                {error && (
                    <div
                        style={{
                            backgroundColor: mode === 'Dark' ? 'rgba(220, 38, 38, 0.15)' : '#FEF2F2',
                            border: `1px solid ${mode === 'Dark' ? 'rgba(220, 38, 38, 0.3)' : '#FECACA'}`,
                            borderRadius: '12px',
                            padding: '16px 20px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                        }}
                    >
                        <svg width="20" height="20" fill="none" stroke={theme.status.cost} strokeWidth="2" viewBox="0 0 24 24" style={{ marginTop: '2px', flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: theme.status.cost, margin: 0, marginBottom: '4px' }}>Error loading dashboard data</h3>
                            <p style={{ fontSize: '14px', color: mode === 'Dark' ? '#FCA5A5' : '#B91C1C', margin: 0, marginBottom: '8px' }}>{error}</p>
                            <button
                                onClick={refresh}
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: theme.status.cost,
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                }}
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* KPI Cards Grid */}
                <div style={{ marginBottom: '24px' }}>
                    <KPIGrid metrics={data?.metrics || null} loading={loading} />
                </div>

                {/* Charts Section - 2 columns */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '24px',
                    }}
                >
                    <CostsByCategoryChart data={data?.costsByCategory || []} />
                    <RevenueProfitChart data={data?.revenueTrend || []} />
                </div>
            </div>
        </DashboardLayout>
    );
};
