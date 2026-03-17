import React, { useState, useEffect, useCallback } from 'react';
import { useUpload } from '../context/UploadContext';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import {
    Search, TrendingDown,
    TrendingUp, Download, Filter, X, Upload
} from 'lucide-react';
// import { mockInventoryData, mockInventoryStats } from '../data/mockInventory';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { ProfitChart } from '../components/inventory/ProfitChart';
import type { InventoryStats } from '../types/inventory';

// --- KPI Card Component ---
const KPICard: React.FC<{
    title: string;
    value: string | number;
    subtext?: string;
    trend?: string;
    trendType?: 'up' | 'down' | 'neutral';
    delay?: number;
}> = ({ title, value, subtext, trend, trendType, delay = 0 }) => {

    const trendColor = trendType === 'up' ? 'text-emerald-600' :
        trendType === 'down' ? 'text-rose-600' :
            'text-slate-500';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: delay * 0.1 }}
            className="kpi-card bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-[160px]"
        >
            <div className="flex justify-between items-start">
                <p className="kpi-label font-medium text-slate-500">{title}</p>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full bg-slate-50 ${trendColor} flex items-center gap-1`}>
                        {trendType === 'up' ? <TrendingUp size={12} /> : trendType === 'down' ? <TrendingDown size={12} /> : null}
                        {trend}
                    </span>
                )}
            </div>

            <div className="flex flex-col mt-auto">
                <h3 className="kpi-value font-bold text-slate-900 tracking-tight">{value}</h3>

                {subtext && (
                    <p className="kpi-meta font-medium text-slate-400 flex items-center gap-1 opacity-75">
                        {subtext}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

// --- Main Inventory Page ---
export const Inventory: React.FC = () => {
    const { user, session, loading: authLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Data States - Start empty to ensure no fake data is shown
    const [inventoryData, setInventoryData] = useState<any[]>([]);
    const [inventoryStats, setInventoryStats] = useState<InventoryStats>({
        total_products: 0,
        total_stock_value: 0,
        total_available_stock: 0,
        active_orders_count: 0,
        returned_units: 0,
        net_realized_profit: 0,
        low_stock_items: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (authLoading) return;
        const userId = user?.id || session?.user?.id;

        if (!userId) {
            if (!authLoading) setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        console.log('🔄 Starting Persistent Inventory Fetch for User:', userId);

        let isSuccess = false;
        let attempt = 1;

        // Loop until success
        while (!isSuccess) {
            try {
                const response = await fetch('https://n8n.srv1181726.hstgr.cloud/webhook/Inventory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: userId }),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('📦 Inventory API Response:', result);

                    let products = [];
                    let stats = null;

                    if (Array.isArray(result)) {
                        products = result;
                    } else if (result && typeof result === 'object') {
                        products = result.products || result.data || result.inventory || [];
                        stats = result.stats || result.statistics || null;
                    }

                    if (Array.isArray(products)) {
                        console.log(`✅ Loaded ${products.length} products`);
                        setInventoryData(products);
                    }

                    if (stats) {
                        console.log('✅ Loaded stats', stats);
                        setInventoryStats(stats);
                    }

                    isSuccess = true;
                    setIsLoading(false);
                } else {
                    console.warn(`⚠️ Attempt ${attempt} failed: ${response.status}. Retrying in 3s...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    attempt++;
                }
            } catch (err: any) {
                console.warn(`❌ Attempt ${attempt} error: ${err.message}. Retrying in 3s...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                attempt++;
            }
        }
    }, [user, session, authLoading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const { openUpload } = useUpload();

    // Stats & Data
    const data = inventoryData;
    const stats: InventoryStats = inventoryStats;

    // Calculate total value


    // Derived stats
    const returnsRate = stats.active_orders_count > 0
        ? ((stats.returned_units / stats.active_orders_count) * 100)
        : 0;

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleFilter = (filter: string) => {
        if (activeFilters.includes(filter)) {
            setActiveFilters(activeFilters.filter(f => f !== filter));
        } else {
            setActiveFilters([...activeFilters, filter]);
        }
    };

    const exportToCSV = () => {
        const headers = ['ID', 'SKU', 'Name', 'Category', 'Total Stock', 'Available Stock', 'Price', 'Cost', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map(item => [
                item.id,
                item.sku,
                `"${item.name}"`,
                item.category,
                item.stock.total,
                item.stock.available,
                item.financials.price,
                item.financials.cost,
                `"${Object.entries(item.status).map(([k, v]) => `${k}:${v}`).join(' ')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DashboardLayout>
            <div className="inventory-page bg-slate-50/50 w-full max-w-[1920px] mx-auto">

                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Intelligence</h1>
                        <p className="text-slate-500 text-sm font-medium">Operational Visibility & Analytics</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={openUpload}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg text-sm shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            <Upload size={16} />
                            <span>Upload Sheet</span>
                        </button>
                        <button
                            onClick={exportToCSV}
                            disabled={isLoading || !!error || data.length === 0}
                            className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-semibold rounded-lg transition-all text-sm shadow-sm ${isLoading || !!error || data.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                        >
                            <Download size={16} />
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[600px] w-full">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <p className="mt-6 text-slate-500 font-medium text-lg animate-pulse">Syncing Inventory Data...</p>
                        <p className="text-slate-400 text-sm mt-2">This may take a few moments</p>
                    </div>
                ) : (
                    <>
                        {/* 1. KPI Grid (Row 1) */}
                        <div className="inventory-kpis">
                            <KPICard
                                title="Available Stock"
                                value={stats.total_available_stock}
                                trend="+12%"
                                trendType="up"
                                subtext="Across all warehouses"
                                delay={0}
                            />
                            <KPICard
                                title="Pending Orders"
                                value={stats.active_orders_count}
                                trend="+5"
                                trendType="neutral"
                                subtext="Awaiting fulfillment"
                                delay={1}
                            />
                            <KPICard
                                title="Returns Rate"
                                value={`${returnsRate.toFixed(1)}%`}
                                trend="-0.5%"
                                trendType="up" // Up because returns went down (good) - logic adjusted visually
                                subtext="Last 30 days"
                                delay={2}
                            />
                            <KPICard
                                title="Low Stock Items"
                                value={stats.low_stock_items}
                                trend="Alert"
                                trendType="down"
                                subtext="Reorder immediately"
                                delay={3}
                            />
                        </div>

                        {/* 2. Profit Chart (Row 2 - Full Width) */}
                        <div className="profit-chart-card bg-white border border-slate-200 shadow-sm overflow-hidden h-[380px]">
                            <ProfitChart />
                        </div>

                        {/* 3. Filter Bar & Table Section */}
                        <div className="flex flex-col gap-4">

                            {/* Filter Bar */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="inventory-filters flex flex-wrap items-center justify-between gap-6 bg-white border border-slate-200 shadow-sm"
                            >
                                {/* Search */}
                                <div className="relative w-full max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search Product / SKU..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all placeholder:text-slate-400"
                                    />
                                </div>

                                {/* Filter Chips/Actions */}
                                <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
                                    <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
                                        {['Low Stock', 'Pending', 'Returns'].map(filter => (
                                            <button
                                                key={filter}
                                                onClick={() => toggleFilter(filter)}
                                                className={`filter-chip px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                                                    ${activeFilters.includes(filter)
                                                        ? 'bg-slate-800 text-white border-slate-800'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                {filter}
                                                {activeFilters.includes(filter) && <X size={12} className="ml-1 inline-block" />}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Dropdowns Mock */}
                                    <select className="rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold outline-none hover:bg-slate-50 cursor-pointer">
                                        <option>All Categories</option>
                                        <option>Footwear</option>
                                        <option>Apparel</option>
                                    </select>

                                    <select className="rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold outline-none hover:bg-slate-50 cursor-pointer">
                                        <option>All Couriers</option>
                                        <option>Bosta</option>
                                        <option>Aramex</option>
                                    </select>

                                    <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                                        <Filter size={18} />
                                    </button>
                                </div>
                            </motion.div>

                            {/* Table Container */}
                            <div className="inventory-table-wrapper bg-white border border-slate-200 overflow-hidden shadow-sm h-full min-h-[600px]">
                                <InventoryTable data={filteredData} />
                            </div>
                        </div>
                    </>
                )}

            </div>
        </DashboardLayout>
    );
};
