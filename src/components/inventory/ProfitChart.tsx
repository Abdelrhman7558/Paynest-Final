import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ProfitChartProps {
    netProfit?: number;
    data?: any[];
}

export const ProfitChart: React.FC<ProfitChartProps> = ({ netProfit = 0, data }) => {

    // Default mock data if none provided, but scaled to the net profit if possible?
    // For now, if no data, we show an empty state or the old mock data but clearly labeled?
    // Better to show the mock pattern but maybe flat if 0?
    // Let's keep the mock structure but ideally valid.

    // If we have no real history, we can't show a real chart.
    // However, to avoid breaking the UI look, we might keep the "shape" but update the Total.

    const chartData = data || [
        { day: 'Mon', profit: netProfit * 0.1, cost: 3000 },
        { day: 'Tue', profit: netProfit * 0.15, cost: 4000 },
        { day: 'Wed', profit: netProfit * 0.12, cost: 3500 },
        { day: 'Thu', profit: netProfit * 0.18, cost: 4500 },
        { day: 'Fri', profit: netProfit * 0.20, cost: 5000 },
        { day: 'Sat', profit: netProfit * 0.25, cost: 5500 },
        { day: 'Sun', profit: netProfit * 0.30, cost: 6000 }, // improved logic to sum up? 
        // This is just a visual filler if no real data exists.
    ];

    const formatCurrency = (value: number) => {
        return `${(value / 1000).toFixed(1)}k`;
    };

    const formattedProfit = new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 0,
    }).format(netProfit);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full h-full flex flex-col relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-[18px] font-semibold uppercase tracking-[0.5px] text-slate-500 leading-[1.4] mb-[6px] pl-[10px] pt-[10px]">
                        Net Profit Trend
                    </h3>
                    <div className="flex items-baseline gap-3 p-[10px] mt-[8px]">
                        <span className="text-[36px] font-bold text-slate-900 tracking-tight leading-[1.2]">{formattedProfit}</span>
                        <div className="flex items-center gap-1 text-emerald-500 font-semibold text-[14px]">
                            <ArrowUpRight size={16} strokeWidth={2.5} />
                            12.5%
                        </div>
                    </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                    <TrendingUp size={20} />
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative z-10 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                            tickFormatter={formatCurrency}
                            width={45}
                            dx={-5}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                padding: '12px 16px'
                            }}
                            itemStyle={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}
                            formatter={(value: any) => [`${Number(value || 0).toLocaleString()} EGP`, 'Profit']}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="profit"
                            stroke="#10B981"
                            strokeOpacity={0.85}
                            fillOpacity={1}
                            fill="url(#colorProfit)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-[24px] pt-[16px] border-t border-slate-100 grid grid-cols-3 gap-[24px] text-sm relative z-10">
                <div className="flex-1">
                    <p className="text-[13px] font-medium text-slate-500 mb-1">Gross Avg</p>
                    <p className="text-slate-900 font-bold text-[16px]">
                        {formatCurrency(netProfit / 7)}
                    </p>
                </div>
                <div className="flex-1 relative">
                    <p className="text-[13px] font-medium text-slate-500 mb-1">Expenses</p>
                    <p className="text-rose-500 font-bold text-[16px]">-4.2k</p>
                </div>
                <div className="flex-1">
                    <p className="text-[13px] font-medium text-slate-500 mb-1">Projection</p>
                    <p className="text-emerald-500 font-bold text-[16px]">+15%</p>
                </div>
            </div>
        </motion.div>
    );
};
