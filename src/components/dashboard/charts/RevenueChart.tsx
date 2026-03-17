import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLanguage } from '../../../context/LanguageContext';

interface RevenueChartProps {
    data: any[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const { t } = useLanguage();
    return (
        <div className="rounded-xl p-6 shadow-sm transition-colors duration-200"
            style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <div className="w-2 h-6 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                {t('revenueGrowthTrajectory')}
            </h3>

            {data.length === 0 ? (
                <div className="h-[300px] w-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg">
                    {t('awaitingData')}
                </div>
            ) : (
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12 }} // Slate 400 matches valid hex
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12 }}
                                tickFormatter={(val) => `EGP ${val / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--color-card)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}
                                cursor={{ stroke: 'var(--color-text-secondary)', strokeDasharray: '3 3' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="var(--color-primary)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};
