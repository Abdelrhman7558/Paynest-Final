import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Calculator, Database, Lightbulb, ArrowRight, Table, Activity } from 'lucide-react';
import type { MetricDrillDown } from '../../types/reports';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DrillDownPanelProps {
    isOpen: boolean;
    onClose: () => void;
    metric: MetricDrillDown | null;
}

export const DrillDownPanel: React.FC<DrillDownPanelProps> = ({ isOpen, onClose, metric }) => {
    return (
        <AnimatePresence>
            {isOpen && metric && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{metric.metricId}</h2>
                                <p className="text-sm text-slate-500">Analysis & Breakdown</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">

                            {/* 1. Definition & Formula */}
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                <div className="flex items-start gap-3 mb-4">
                                    <Info className="text-blue-500 mt-1" size={18} />
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-sm">Definition</h3>
                                        <p className="text-sm text-slate-600 mt-1">{metric.explanation}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calculator className="text-emerald-500 mt-1" size={18} />
                                    <div className="w-full">
                                        <h3 className="font-semibold text-slate-900 text-sm">Calculation Logic</h3>
                                        <div className="mt-2 bg-white border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-700 overflow-x-auto">
                                            {metric.formula}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. AI Insight */}
                            {metric.aiInsight && (
                                <div className={`
                                    rounded-xl p-5 border
                                    ${metric.aiInsight.type === 'success' ? 'bg-emerald-50 border-emerald-100' :
                                        metric.aiInsight.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}
                                `}>
                                    <div className="flex items-start gap-3">
                                        <Lightbulb className={`
                                            mt-0.5
                                            ${metric.aiInsight.type === 'success' ? 'text-emerald-600' :
                                                metric.aiInsight.type === 'warning' ? 'text-amber-600' : 'text-blue-600'}
                                        `} size={18} />
                                        <div>
                                            <h3 className={`font-semibold text-sm mb-1
                                                ${metric.aiInsight.type === 'success' ? 'text-emerald-800' :
                                                    metric.aiInsight.type === 'warning' ? 'text-amber-800' : 'text-blue-800'}
                                            `}>AI Agent Insight</h3>
                                            <p className={`text-sm
                                                ${metric.aiInsight.type === 'success' ? 'text-emerald-700' :
                                                    metric.aiInsight.type === 'warning' ? 'text-amber-700' : 'text-blue-700'}
                                            `}>
                                                {metric.aiInsight.text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. Trend Chart */}
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Activity size={18} className="text-slate-400" />
                                    Trend Analysis
                                </h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={metric.history}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                minTickGap={30}
                                            />
                                            <YAxis
                                                hide={true}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorValue)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 4. Contributing Factors */}
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Database size={18} className="text-slate-400" />
                                    Breakdown
                                </h3>
                                <div className="space-y-3">
                                    {metric.breakdown.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                                <span className="text-sm text-slate-600">{item.label}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-slate-900">{item.value.toLocaleString()}</p>
                                                <p className="text-xs text-slate-400">{item.percentage}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action: View Raw Data */}
                            <button className="w-full py-3 flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm">
                                <Table size={16} />
                                View Underlying Data
                                <ArrowRight size={16} />
                            </button>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
