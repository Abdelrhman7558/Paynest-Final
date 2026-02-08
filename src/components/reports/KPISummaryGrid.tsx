import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, DollarSign, Wallet,
    ShoppingCart, Package, Activity, BarChart3, ArrowRight
} from 'lucide-react';
import type { ReportKPI } from '../../types/reports';

interface KPISummaryGridProps {
    kpis: ReportKPI[];
    onKpiClick: (kpiId: string) => void;
    isLoading?: boolean;
}

const getIcon = (iconName?: string) => {
    switch (iconName) {
        case 'revenue': return <DollarSign size={20} />;
        case 'profit': return <Wallet size={20} />;
        case 'orders': return <ShoppingCart size={20} />;
        case 'inventory': return <Package size={20} />;
        case 'ads': return <Activity size={20} />;
        default: return <BarChart3 size={20} />;
    }
};

export const KPISummaryGrid: React.FC<KPISummaryGridProps> = ({ kpis, onKpiClick, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, index) => (
                <motion.div
                    key={kpi.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onKpiClick(kpi.id)}
                    className="
                        group relative bg-white border border-slate-200 rounded-xl p-5 
                        cursor-pointer shadow-sm hover:shadow-md hover:border-emerald-500/30 
                        transition-all duration-200
                    "
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-50 group-hover:bg-emerald-50 text-slate-500 group-hover:text-emerald-600 rounded-lg transition-colors">
                            {getIcon(kpi.icon)}
                        </div>
                        {kpi.change !== 0 && (
                            <div className={`
                                flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
                                ${kpi.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}
                            `}>
                                {kpi.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {Math.abs(kpi.change)}%
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-1">{kpi.title}</h3>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold text-slate-900 tracking-tight">
                                {kpi.value}
                            </span>
                            <ArrowRight
                                size={16}
                                className="text-slate-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all"
                            />
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 p-1">
                        <span className="sr-only">Click to view details</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
