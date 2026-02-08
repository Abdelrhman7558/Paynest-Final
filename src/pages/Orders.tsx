import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useUpload } from '../context/UploadContext';
import {
    Search,
    ChevronDown,
    ChevronUp,
    Package,
    ShoppingCart,
    RotateCcw,
    CheckCircle,
    Calendar,
    X,
    Filter,
    Download,
    Plus,
    MoreHorizontal,
    Eye,
    Upload,
} from 'lucide-react';

// Order Item Interface
interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

// Shipping Address Interface
interface ShippingAddress {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    country_code: string;
    zip: string;
}

// Order Interface matching the exact structure
interface Order {
    id: string;
    user_id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    currency: string;
    status: string;
    payment_method: string;
    items_count: number;
    created_at: string;
    updated_at: string;
    shipping_address: ShippingAddress | null;
    items: OrderItem[];
}

interface OrdersResponse {
    orders: Order[];
}

type TabFilter = 'all' | 'unfulfilled' | 'unpaid' | 'open' | 'closed';

export const Orders: React.FC = () => {
    const { user, session, loading: authLoading } = useAuth();
    const { theme } = useTheme();
    const { openUpload } = useUpload();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'order_number' | 'total_amount' | 'created_at'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [activeTab, setActiveTab] = useState<TabFilter>('all');

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchOrders = async () => {
        if (authLoading) return;

        const userId = user?.id || session?.user?.id;

        if (!userId) {
            console.error('❌ User ID missing. User:', user, 'Session:', session);
            setError('User not logged in');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const payload = {
                user_id: userId,
            };

            console.log('📦 Fetching orders with payload:', payload);

            const response = await fetch('https://n8n.srv1181726.hstgr.cloud/webhook/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data: OrdersResponse[] = await response.json();
            console.log('✅ Orders fetched for user:', userId, data);

            if (data && data.length > 0 && data[0].orders) {
                setOrders(data[0].orders);
                setError(null);
            } else {
                setOrders([]);
            }
            setLoading(false);
        } catch (err: any) {
            console.error('❌ Failed to fetch orders:', err);
            setError(err.message || 'Failed to fetch orders');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchOrders();
        }
    }, [user?.id, session?.user?.id, authLoading]);

    // Format currency
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'EGP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Filter orders based on tab and other filters
    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => {
                // Tab filter
                switch (activeTab) {
                    case 'unfulfilled':
                        if (order.status === 'fulfilled' || order.status === 'delivered') return false;
                        break;
                    case 'unpaid':
                        if (order.status !== 'pending') return false;
                        break;
                    case 'open':
                        if (order.status === 'fulfilled' || order.status === 'delivered' || order.status === 'cancelled') return false;
                        break;
                    case 'closed':
                        if (order.status !== 'fulfilled' && order.status !== 'delivered' && order.status !== 'cancelled') return false;
                        break;
                }

                // Search filter
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch =
                    order.order_number?.toLowerCase().includes(searchLower) ||
                    order.customer_name?.toLowerCase().includes(searchLower) ||
                    order.customer_email?.toLowerCase().includes(searchLower);

                // Status filter
                const matchesStatus = !statusFilter || order.status === statusFilter;

                // Date filter
                let matchesDate = true;
                if (dateFilter) {
                    const orderDate = new Date(order.created_at);
                    const today = new Date();
                    switch (dateFilter) {
                        case '7days':
                            matchesDate = orderDate >= new Date(today.setDate(today.getDate() - 7));
                            break;
                        case '30days':
                            matchesDate = orderDate >= new Date(today.setDate(today.getDate() - 30));
                            break;
                        case '90days':
                            matchesDate = orderDate >= new Date(today.setDate(today.getDate() - 90));
                            break;
                    }
                }

                return matchesSearch && matchesStatus && matchesDate;
            })
            .sort((a, b) => {
                let comparison = 0;
                switch (sortBy) {
                    case 'order_number':
                        comparison = (a.order_number || '').localeCompare(b.order_number || '');
                        break;
                    case 'total_amount':
                        comparison = a.total_amount - b.total_amount;
                        break;
                    case 'created_at':
                        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                        break;
                }
                return sortOrder === 'asc' ? comparison : -comparison;
            });
    }, [orders, searchTerm, statusFilter, dateFilter, sortBy, sortOrder, activeTab]);

    // Pagination
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(start, start + itemsPerPage);
    }, [filteredOrders, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    // Stats
    const totalOrders = orders.length;
    const totalSaleAmount = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const returnsOrders = orders.filter(o => o.status === 'returned' || o.status === 'refunded').length;
    const fulfilledOrders = orders.filter(o => o.status === 'fulfilled' || o.status === 'delivered').length;

    const handleSort = (field: typeof sortBy) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const SortIcon = ({ field }: { field: typeof sortBy }) => {
        if (sortBy !== field) return <ChevronDown size={12} style={{ opacity: 0.3, marginLeft: 4 }} />;
        return sortOrder === 'asc' ?
            <ChevronUp size={12} style={{ marginLeft: 4 }} /> :
            <ChevronDown size={12} style={{ marginLeft: 4 }} />;
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; color: string; label: string }> = {
            pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
            paid: { bg: '#D1FAE5', color: '#065F46', label: 'Paid' },
            processing: { bg: '#DBEAFE', color: '#1E40AF', label: 'Processing' },
            fulfilled: { bg: '#D1FAE5', color: '#065F46', label: 'Fulfilled' },
            delivered: { bg: '#D1FAE5', color: '#065F46', label: 'Delivered' },
            cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
            refunded: { bg: '#FEE2E2', color: '#991B1B', label: 'Refunded' },
            returned: { bg: '#FEE2E2', color: '#991B1B', label: 'Returned' },
        };
        const style = styles[status] || { bg: '#F3F4F6', color: '#374151', label: status };
        return (
            <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 500, backgroundColor: style.bg, color: style.color }}>
                {style.label}
            </span>
        );
    };

    const getFulfillmentBadge = (status: string, itemsCount: number) => {
        if (status === 'fulfilled' || status === 'delivered') {
            return (
                <span style={{ color: '#10B981', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={12} /> Fulfilled
                </span>
            );
        }
        return (
            <span style={{ color: '#F59E0B', fontSize: 12 }}>
                {itemsCount} items
            </span>
        );
    };

    // Tab counts
    const tabCounts = useMemo(() => ({
        all: orders.length,
        unfulfilled: orders.filter(o => o.status !== 'fulfilled' && o.status !== 'delivered').length,
        unpaid: orders.filter(o => o.status === 'pending').length,
        open: orders.filter(o => o.status !== 'fulfilled' && o.status !== 'delivered' && o.status !== 'cancelled').length,
        closed: orders.filter(o => o.status === 'fulfilled' || o.status === 'delivered' || o.status === 'cancelled').length,
    }), [orders]);

    // Stats Cards Data
    const statCards = [
        {
            label: 'Total Orders',
            value: totalOrders,
            trend: '+20.1% last week',
            trendUp: true,
            icon: ShoppingCart,
            color: '#6366F1',
        },
        {
            label: 'Order items sale total',
            value: totalSaleAmount,
            isCurrency: true,
            trend: '+15.2% last week',
            trendUp: true,
            icon: Package,
            color: '#10B981',
        },
        {
            label: 'Returns Orders',
            value: returnsOrders,
            trend: '-2.1% last week',
            trendUp: false,
            icon: RotateCcw,
            color: '#EF4444',
        },
        {
            label: 'Fulfilled orders over time',
            value: fulfilledOrders,
            trend: '+12.5% last week',
            trendUp: true,
            icon: CheckCircle,
            color: '#8B5CF6',
        },
    ];

    const clearFilters = () => {
        setStatusFilter('');
        setDateFilter('');
        setSearchTerm('');
        setActiveTab('all');
    };

    const hasActiveFilters = statusFilter || dateFilter || searchTerm;

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Order #', 'Date', 'Customer', 'Email', 'Total', 'Items', 'Status'];
        const rows = filteredOrders.map(o => [
            o.order_number,
            formatDate(o.created_at),
            o.customer_name,
            o.customer_email,
            o.total_amount,
            o.items_count,
            o.status,
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <DashboardLayout>
            <div style={{ backgroundColor: theme.bg.app, minHeight: '100vh' }}>
                {/* Header */}
                <div
                    style={{
                        backgroundColor: theme.bg.card,
                        borderBottom: `1px solid ${theme.border.primary}`,
                        padding: '20px 32px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                            Orders
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <Calendar size={14} color={theme.text.secondary} />
                            <span style={{ fontSize: 12, color: theme.text.secondary }}>
                                Jan 1 - Jan 30, 2026
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={openUpload}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: 'white',
                                color: theme.text.primary,
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 8,
                                fontSize: 13,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            <Upload size={14} />
                            Upload Sheet
                        </button>
                        <button
                            onClick={exportToCSV}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: 'transparent',
                                color: theme.text.primary,
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 8,
                                fontSize: 13,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            <Download size={14} />
                            Export
                        </button>
                    </div>
                </div>

                <div style={{ padding: '24px 32px' }}>
                    {/* Stats Cards Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
                        {statCards.map((stat, i) => (
                            <div
                                key={i}
                                style={{
                                    backgroundColor: theme.bg.card,
                                    borderRadius: 12,
                                    padding: 20,
                                    border: `1px solid ${theme.border.primary}`,
                                }}
                            >
                                <p style={{ fontSize: 12, color: theme.text.secondary, margin: '0 0 8px' }}>
                                    {stat.label}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                    <span style={{ fontSize: 28, fontWeight: 700, color: theme.text.primary }}>
                                        {stat.isCurrency ? formatCurrency(stat.value as number, 'EGP') : stat.value}
                                    </span>
                                    <span style={{ fontSize: 12, fontWeight: 500, color: stat.trendUp ? '#10B981' : '#EF4444' }}>
                                        ↗
                                    </span>
                                </div>
                                <p style={{ fontSize: 11, color: stat.trendUp ? '#10B981' : '#EF4444', margin: '6px 0 0' }}>
                                    {stat.trend}
                                </p>
                                {/* Mini sparkline placeholder */}
                                <div style={{ marginTop: 12, height: 24, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                                    {[40, 60, 35, 80, 55, 70, 45, 90, 65, 75].map((h, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                flex: 1,
                                                height: `${h}%`,
                                                backgroundColor: stat.color,
                                                opacity: 0.3 + (idx * 0.07),
                                                borderRadius: 2,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Card */}
                    <div
                        style={{
                            backgroundColor: theme.bg.card,
                            borderRadius: 12,
                            border: `1px solid ${theme.border.primary}`,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Tabs */}
                        <div
                            style={{
                                display: 'flex',
                                gap: 0,
                                borderBottom: `1px solid ${theme.border.primary}`,
                                padding: '0 20px',
                            }}
                        >
                            {(['all', 'unfulfilled', 'unpaid', 'open', 'closed'] as TabFilter[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                                    style={{
                                        padding: '14px 20px',
                                        backgroundColor: 'transparent',
                                        color: activeTab === tab ? theme.accent.primary : theme.text.secondary,
                                        border: 'none',
                                        borderBottom: activeTab === tab ? `2px solid ${theme.accent.primary}` : '2px solid transparent',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {tab} {tabCounts[tab] > 0 && <span style={{ opacity: 0.7 }}>({tabCounts[tab]})</span>}
                                </button>
                            ))}
                            <button
                                style={{
                                    padding: '14px 16px',
                                    backgroundColor: 'transparent',
                                    color: theme.text.secondary,
                                    border: 'none',
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                }}
                            >
                                <Plus size={14} /> Add
                            </button>
                        </div>

                        {/* Search & Filter Row */}
                        <div
                            style={{
                                padding: '12px 20px',
                                borderBottom: `1px solid ${theme.border.primary}`,
                                display: 'flex',
                                gap: 12,
                                alignItems: 'center',
                            }}
                        >
                            <div style={{ position: 'relative', flex: '0 0 300px' }}>
                                <Search
                                    size={14}
                                    color={theme.text.secondary}
                                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px 8px 32px',
                                        border: `1px solid ${theme.border.primary}`,
                                        borderRadius: 6,
                                        backgroundColor: theme.bg.app,
                                        color: theme.text.primary,
                                        fontSize: 12,
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                style={{
                                    padding: '8px 14px',
                                    backgroundColor: 'transparent',
                                    color: theme.text.primary,
                                    border: `1px solid ${theme.border.primary}`,
                                    borderRadius: 6,
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <Filter size={12} />
                                Filter
                            </button>

                            {/* Active filter pills */}
                            {dateFilter && (
                                <span style={{ padding: '5px 10px', backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: 16, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Date
                                    <X size={10} onClick={() => setDateFilter('')} style={{ cursor: 'pointer' }} />
                                </span>
                            )}
                            {statusFilter && (
                                <span style={{ padding: '5px 10px', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: 16, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Status: {statusFilter}
                                    <X size={10} onClick={() => setStatusFilter('')} style={{ cursor: 'pointer' }} />
                                </span>
                            )}

                            <div style={{ flex: 1 }} />

                            {/* Pagination indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button style={{ width: 28, height: 28, border: `1px solid ${theme.border.primary}`, borderRadius: 4, backgroundColor: 'transparent', cursor: 'pointer' }}>
                                    <ChevronDown size={14} color={theme.text.secondary} style={{ transform: 'rotate(90deg)' }} />
                                </button>
                                <span style={{ fontSize: 12, color: theme.text.secondary }}>1 / {totalPages || 1}</span>
                                <button style={{ width: 28, height: 28, border: `1px solid ${theme.border.primary}`, borderRadius: 4, backgroundColor: 'transparent', cursor: 'pointer' }}>
                                    <ChevronDown size={14} color={theme.text.secondary} style={{ transform: 'rotate(-90deg)' }} />
                                </button>
                            </div>
                        </div>

                        {/* Filter Dropdowns */}
                        {showFilters && (
                            <div style={{ padding: '12px 20px', backgroundColor: theme.bg.app, borderBottom: `1px solid ${theme.border.primary}`, display: 'flex', gap: 12 }}>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    style={{ padding: '6px 10px', border: `1px solid ${theme.border.primary}`, borderRadius: 4, backgroundColor: theme.bg.card, color: theme.text.primary, fontSize: 12 }}
                                >
                                    <option value="">All Time</option>
                                    <option value="7days">Last 7 Days</option>
                                    <option value="30days">Last 30 Days</option>
                                    <option value="90days">Last 90 Days</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{ padding: '6px 10px', border: `1px solid ${theme.border.primary}`, borderRadius: 4, backgroundColor: theme.bg.card, color: theme.text.primary, fontSize: 12 }}
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="processing">Processing</option>
                                    <option value="fulfilled">Fulfilled</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {hasActiveFilters && (
                                    <button onClick={clearFilters} style={{ padding: '6px 12px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>
                                        Clear
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Table */}
                        {loading ? (
                            <div style={{ padding: 48, textAlign: 'center' }}>
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        border: `3px solid ${theme.border.primary}`,
                                        borderTop: `3px solid ${theme.accent.primary}`,
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                        margin: '0 auto 12px',
                                    }}
                                />
                                <p style={{ fontSize: 13, color: theme.text.secondary }}>Loading orders...</p>
                            </div>
                        ) : error ? (
                            <div style={{ padding: 48, textAlign: 'center' }}>
                                <p style={{ fontSize: 13, color: '#EF4444' }}>{error}</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                    <thead>
                                        <tr style={{ backgroundColor: theme.bg.app }}>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>
                                                <input type="checkbox" />
                                            </th>
                                            <th
                                                onClick={() => handleSort('order_number')}
                                                style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}`, cursor: 'pointer' }}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center' }}>Order <SortIcon field="order_number" /></span>
                                            </th>
                                            <th
                                                onClick={() => handleSort('created_at')}
                                                style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}`, cursor: 'pointer' }}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center' }}>Date <SortIcon field="created_at" /></span>
                                            </th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>Customer</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>Payment</th>
                                            <th
                                                onClick={() => handleSort('total_amount')}
                                                style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}`, cursor: 'pointer' }}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>Total <SortIcon field="total_amount" /></span>
                                            </th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>Delivery</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>Items</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>Fulfillment</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} style={{ padding: 48, textAlign: 'center', color: theme.text.secondary }}>
                                                    No orders found
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedOrders.map((order) => (
                                                <React.Fragment key={order.id}>
                                                    <tr
                                                        style={{
                                                            backgroundColor: expandedRow === order.id ? theme.bg.app : 'transparent',
                                                            transition: 'background 0.15s',
                                                        }}
                                                    >
                                                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border.primary}` }}>
                                                            <input type="checkbox" />
                                                        </td>
                                                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border.primary}`, color: theme.accent.primary, fontWeight: 500 }}>
                                                            {order.order_number}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border.primary}`, color: theme.text.secondary }}>
                                                            {formatDate(order.created_at)}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border.primary}`, color: theme.text.primary }}>
                                                            {order.customer_name || 'عميل'}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border.primary}`, textAlign: 'center' }}>
                                                            {getStatusBadge(order.status)}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border.primary}`, textAlign: 'right', fontWeight: 600, color: theme.text.primary }}>
                                                            {formatCurrency(order.total_amount, order.currency)}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border.primary}`, textAlign: 'center', color: theme.text.secondary }}>
                                                            N/A
                                                        </td>
                                                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border.primary}`, textAlign: 'center', color: theme.text.secondary }}>
                                                            {order.items_count} items
                                                        </td>
                                                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border.primary}`, textAlign: 'center' }}>
                                                            {getFulfillmentBadge(order.status, order.items_count)}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border.primary}`, textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                                <button
                                                                    onClick={() => setExpandedRow(expandedRow === order.id ? null : order.id)}
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                                                >
                                                                    <Eye size={14} color={theme.text.secondary} />
                                                                </button>
                                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                                                    <MoreHorizontal size={14} color={theme.text.secondary} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded Row */}
                                                    {expandedRow === order.id && (
                                                        <tr>
                                                            <td colSpan={10} style={{ padding: 0, borderBottom: `1px solid ${theme.border.primary}`, backgroundColor: theme.bg.app }}>
                                                                <div style={{ padding: '16px 32px', display: 'flex', gap: 48 }}>
                                                                    <div>
                                                                        <p style={{ fontSize: 11, color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>Email</p>
                                                                        <p style={{ fontSize: 12, color: theme.text.primary }}>{order.customer_email || 'N/A'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p style={{ fontSize: 11, color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>Payment Method</p>
                                                                        <p style={{ fontSize: 12, color: theme.text.primary }}>{order.payment_method || 'N/A'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p style={{ fontSize: 11, color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>Shipping</p>
                                                                        <p style={{ fontSize: 12, color: theme.text.primary }}>
                                                                            {order.shipping_address ? `${order.shipping_address.city}, ${order.shipping_address.country}` : 'N/A'}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p style={{ fontSize: 11, color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>Updated</p>
                                                                        <p style={{ fontSize: 12, color: theme.text.primary }}>{formatDate(order.updated_at)}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Footer Pagination */}
                        {!loading && !error && filteredOrders.length > 0 && (
                            <div style={{ padding: '12px 20px', borderTop: `1px solid ${theme.border.primary}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: theme.text.secondary }}>
                                    Show
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                        style={{ padding: '4px 8px', border: `1px solid ${theme.border.primary}`, borderRadius: 4, backgroundColor: theme.bg.card, color: theme.text.primary, fontSize: 12 }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                    items
                                </div>

                                <p style={{ fontSize: 12, color: theme.text.secondary }}>
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length}
                                </p>

                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        style={{ padding: '6px 10px', border: `1px solid ${theme.border.primary}`, borderRadius: 4, backgroundColor: 'transparent', color: theme.text.primary, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, fontSize: 12 }}
                                    >
                                        Prev
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            style={{ padding: '6px 10px', border: `1px solid ${currentPage === page ? theme.accent.primary : theme.border.primary}`, borderRadius: 4, backgroundColor: currentPage === page ? theme.accent.primary : 'transparent', color: currentPage === page ? '#fff' : theme.text.primary, cursor: 'pointer', fontSize: 12 }}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        style={{ padding: '6px 10px', border: `1px solid ${theme.border.primary}`, borderRadius: 4, backgroundColor: 'transparent', color: theme.text.primary, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, fontSize: 12 }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </DashboardLayout>
    );
};
