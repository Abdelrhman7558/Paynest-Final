import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    TrendingUp,
    Clock,
    Wallet,
    Search,
    Filter,
    X,
    ChevronDown,
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { KPICard } from '../components/dashboard/KPICard';
import { PayablesTable } from '../components/dashboard/PayablesTable';
import { VendorDetailDrawer } from '../components/dashboard/VendorDetailDrawer';
import { useTheme } from '../context/ThemeContext';
import { fetchAPMetrics } from '../services/vendorService';
import type { APMetrics, PurchaseRecord, PurchaseStatus } from '../types/accountsPayable';

export const AccountsPayable: React.FC = () => {
    const { theme, mode } = useTheme();
    const [metrics, setMetrics] = useState<APMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRecord | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PurchaseStatus | undefined>();
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [activeKPI, setActiveKPI] = useState<string | null>(null);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAPMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('Error loading metrics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = (purchase: PurchaseRecord) => {
        setSelectedPurchase(purchase);
        setDrawerOpen(true);
    };

    const handleKPIClick = (kpiType: string) => {
        setActiveKPI(activeKPI === kpiType ? null : kpiType);

        // Set filter based on KPI
        switch (kpiType) {
            case 'outstanding':
                setStatusFilter(statusFilter === 'unpaid' ? undefined : 'unpaid');
                break;
            case 'paid':
                setStatusFilter(statusFilter === 'paid' ? undefined : 'paid');
                break;
            default:
                setStatusFilter(undefined);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };



    const statusOptions: { value: PurchaseStatus; label: string }[] = [
        { value: 'paid', label: 'Paid' },
        { value: 'partially_paid', label: 'Partially Paid' },
        { value: 'unpaid', label: 'Unpaid' },
    ];

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter(undefined);
        setActiveKPI(null);
    };

    const hasActiveFilters = searchTerm || statusFilter;

    return (
        <DashboardLayout>
            <DashboardHeader
                title="Accounts Payable"
                subtitle="Track suppliers, purchases, dues, and profitability"
                onRefresh={loadMetrics}
            />

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* KPI Cards - 4 Cards Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px',
                }}>
                    {/* Total Purchase Cost */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleKPIClick('purchase')}
                        style={{ cursor: 'pointer' }}
                    >
                        <KPICard
                            title="Total Purchase Cost"
                            value={isLoading ? '...' : formatCurrency(metrics?.totalPurchaseCost || 0)}
                            icon={<DollarSign size={22} />}
                            iconBgColor="#DBEAFE"
                            iconBgColorDark="rgba(59, 130, 246, 0.2)"
                            iconColor="#3B82F6"
                            tooltip="Total money spent on goods"
                            change={metrics?.purchaseCostChange}
                        />
                    </motion.div>

                    {/* Total Revenue from Goods */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleKPIClick('revenue')}
                        style={{ cursor: 'pointer' }}
                    >
                        <KPICard
                            title="Revenue from Goods"
                            value={isLoading ? '...' : formatCurrency(metrics?.totalRevenueFromGoods || 0)}
                            icon={<TrendingUp size={22} />}
                            iconBgColor="#DCFCE7"
                            iconBgColorDark="rgba(34, 197, 94, 0.2)"
                            iconColor="#22C55E"
                            tooltip="Revenue generated from sold inventory"
                            change={metrics?.revenueChange}
                        />
                    </motion.div>

                    {/* Outstanding Payables */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleKPIClick('outstanding')}
                        style={{ cursor: 'pointer' }}
                    >
                        <KPICard
                            title="Outstanding Payables"
                            value={isLoading ? '...' : formatCurrency(metrics?.outstandingPayables || 0)}
                            icon={<Clock size={22} />}
                            iconBgColor="#FEF3C7"
                            iconBgColorDark="rgba(245, 158, 11, 0.2)"
                            iconColor="#F59E0B"
                            tooltip="Money still owed to vendors"
                            change={metrics?.outstandingChange}
                        />
                    </motion.div>

                    {/* Net Goods Profit */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleKPIClick('profit')}
                        style={{ cursor: 'pointer' }}
                    >
                        <KPICard
                            title="Net Goods Profit"
                            value={isLoading ? '...' : formatCurrency(metrics?.netGoodsProfit || 0)}
                            icon={<Wallet size={22} />}
                            iconBgColor="#EDE9FE"
                            iconBgColorDark="rgba(139, 92, 246, 0.2)"
                            iconColor="#8B5CF6"
                            tooltip="Revenue minus Purchase Cost"
                            change={metrics?.profitChange}
                        />
                    </motion.div>
                </div>

                {/* Filter Bar */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
                        <Search
                            size={18}
                            color={theme.text.muted}
                            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                        />
                        <input
                            type="text"
                            placeholder="Search vendors, products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 14px 12px 44px',
                                borderRadius: '12px',
                                border: `1px solid ${theme.border.primary}`,
                                backgroundColor: theme.bg.card,
                                color: theme.text.primary,
                                fontSize: '14px',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Status Filter */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: `1px solid ${statusFilter ? theme.accent.primary : theme.border.primary}`,
                                backgroundColor: statusFilter
                                    ? (mode === 'Dark' ? 'rgba(15, 118, 110, 0.1)' : '#E6FAF8')
                                    : theme.bg.card,
                                color: statusFilter ? theme.accent.primary : theme.text.secondary,
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            <Filter size={16} />
                            {statusFilter
                                ? statusOptions.find(s => s.value === statusFilter)?.label
                                : 'Status'}
                            <ChevronDown size={14} />
                        </button>

                        {showStatusDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                marginTop: '8px',
                                backgroundColor: theme.bg.card,
                                borderRadius: '12px',
                                border: `1px solid ${theme.border.primary}`,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                zIndex: 100,
                                minWidth: '160px',
                                overflow: 'hidden',
                            }}>
                                <button
                                    onClick={() => { setStatusFilter(undefined); setShowStatusDropdown(false); }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: 'none',
                                        backgroundColor: !statusFilter ? theme.bg.hover : 'transparent',
                                        color: theme.text.primary,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                    }}
                                >
                                    All Statuses
                                </button>
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => { setStatusFilter(option.value); setShowStatusDropdown(false); }}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: 'none',
                                            backgroundColor: statusFilter === option.value ? theme.bg.hover : 'transparent',
                                            color: theme.text.primary,
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: mode === 'Dark' ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                                color: '#EF4444',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            <X size={14} />
                            Clear
                        </button>
                    )}
                </div>

                {/* Main Payables Table */}
                <PayablesTable
                    onRowClick={handleRowClick}
                    onRefresh={loadMetrics}
                    filterStatus={statusFilter}
                    searchTerm={searchTerm}
                />
            </div>

            {/* Vendor Detail Drawer */}
            <VendorDetailDrawer
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setSelectedPurchase(null); }}
                purchase={selectedPurchase}
                onRefresh={() => { loadMetrics(); }}
            />
        </DashboardLayout>
    );
};
