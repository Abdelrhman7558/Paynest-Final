import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from '../../../context/LanguageContext';

interface CategoryDrilldownProps {
    data: any[];
}

// Bright palette for dark mode
const COLORS = ['#2DD4BF', '#FBBF24', '#F87171', '#60A5FA', '#A3E635'];

export const CategoryDrilldown: React.FC<CategoryDrilldownProps> = ({ data }) => {
    const { t } = useLanguage();
    return (
        <div className="rounded-xl p-6 shadow-sm transition-colors duration-200"
            style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <div className="w-2 h-6 rounded-full" style={{ backgroundColor: 'var(--color-warning)' }}></div>
                {t('opexAllocation')}
            </h3>

            {data.length === 0 ? (
                <div className="h-[300px] w-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg">
                    {t('noExpenseData')}
                </div>
            ) : (
                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--color-card)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};
