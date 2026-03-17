import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Search,
    ChevronDown,
    ChevronUp,

    Filter,
    Calendar,
    X,
    Users,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    FileText,
} from 'lucide-react';

// Customer Address Interface
interface CustomerAddress {
    address1: string;
    address2: string;
    city: string;
    province: string;
    country: string;
    country_code: string;
    zip: string;
    is_default: boolean;
}

// Customer Interface matching the exact structure
interface Customer {
    id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string;
    total_orders: number;
    total_spent: number;
    currency: string;
    last_order_date: string;
    status: string;
    created_at: string;
    address: CustomerAddress;
}

interface CustomersResponse {
    customers: Customer[];
}

export const Customers: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { theme, mode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'total_spent' | 'total_orders' | 'last_order_date'>('last_order_date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [cityFilter, setCityFilter] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchCustomers = async () => {
        if (authLoading) return;

        if (!user?.id) {
            setError('User not logged in');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('👥 Fetching customers for user:', user.id);

            const response = await fetch('https://n8n.srv1181726.hstgr.cloud/webhook/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    timestamp: new Date().toISOString(),
                }),
            });

            const data: CustomersResponse[] = await response.json();
            console.log('✅ Customers fetched:', data);

            if (data && data.length > 0 && data[0].customers) {
                setCustomers(data[0].customers);
                setError(null);
            } else {
                setCustomers([]);
            }
            setLoading(false);
        } catch (err: any) {
            console.error('❌ Failed to fetch customers:', err);
            setError(err.message || 'Failed to fetch customers');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchCustomers();
        }
    }, [user?.id, authLoading]);

    // Format currency
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'EGP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Get unique cities for filter
    const uniqueCities = useMemo(() => {
        const cities = customers
            .map(c => c.address?.city)
            .filter((city, index, self) => city && self.indexOf(city) === index);
        return cities;
    }, [customers]);

    // Filter and sort customers
    const filteredCustomers = useMemo(() => {
        return customers
            .filter(customer => {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch =
                    customer.name?.toLowerCase().includes(searchLower) ||
                    customer.email?.toLowerCase().includes(searchLower) ||
                    customer.phone?.includes(searchTerm) ||
                    customer.address?.city?.toLowerCase().includes(searchLower);

                const matchesStatus = !statusFilter || customer.status === statusFilter;
                const matchesCity = !cityFilter || customer.address?.city === cityFilter;

                // Date filter logic
                let matchesDate = true;
                if (dateFilter) {
                    const orderDate = new Date(customer.last_order_date);
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

                return matchesSearch && matchesStatus && matchesCity && matchesDate;
            })
            .sort((a, b) => {
                let comparison = 0;
                switch (sortBy) {
                    case 'name':
                        comparison = (a.name || '').localeCompare(b.name || '');
                        break;
                    case 'total_spent':
                        comparison = a.total_spent - b.total_spent;
                        break;
                    case 'total_orders':
                        comparison = a.total_orders - b.total_orders;
                        break;
                    case 'last_order_date':
                        comparison = new Date(a.last_order_date).getTime() - new Date(b.last_order_date).getTime();
                        break;
                }
                return sortOrder === 'asc' ? comparison : -comparison;
            });
    }, [customers, searchTerm, statusFilter, cityFilter, dateFilter, sortBy, sortOrder]);

    // Pagination
    const paginatedCustomers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredCustomers.slice(start, start + itemsPerPage);
    }, [filteredCustomers, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    // Stats
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'enabled').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0);
    const totalOrders = customers.reduce((sum, c) => sum + (Number(c.total_orders) || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

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

    const clearFilters = () => {
        setStatusFilter('');
        setDateFilter('');
        setCityFilter('');
        setSearchTerm('');
    };

    const hasActiveFilters = statusFilter || dateFilter || cityFilter || searchTerm;

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Serial', 'Name', 'Email', 'Phone', 'City', 'Orders', 'Total Spent', 'Last Order', 'Status'];
        const rows = filteredCustomers.map((c, i) => [
            i + 1,
            c.name,
            c.email,
            c.phone,
            c.address?.city || '',
            c.total_orders,
            c.total_spent,
            formatDate(c.last_order_date),
            c.status,
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Stats Card Colors
    const statCards = [
        {
            label: 'Total Customers',
            value: totalCustomers.toLocaleString(),
            icon: Users,
            bgColor: '#10B981',
            iconBg: '#10B981',
        },
        {
            label: 'Total Orders',
            value: totalOrders.toLocaleString(),
            icon: ShoppingCart,
            bgColor: '#F59E0B',
            iconBg: '#F59E0B',
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(totalRevenue, 'EGP'),
            icon: DollarSign,
            bgColor: '#10B981',
            iconBg: '#10B981',
        },
        {
            label: 'Active Customers',
            value: activeCustomers.toLocaleString(),
            icon: TrendingUp,
            bgColor: '#8B5CF6',
            iconBg: '#8B5CF6',
        },
        {
            label: 'Avg Order Value',
            value: formatCurrency(avgOrderValue, 'EGP'),
            icon: FileText,
            bgColor: '#EF4444',
            iconBg: '#EF4444',
        },
    ];

    return (
        <DashboardLayout>
            <div style={{ backgroundColor: theme.bg.app, minHeight: '100vh', padding: '24px 32px' }}>
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                        Customers
                    </h1>
                    <p style={{ fontSize: 13, color: theme.text.secondary, margin: '4px 0 0' }}>
                        Details about your customers
                    </p>
                </div>

                {/* Stats Cards Row */}
                <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
                    {statCards.map((stat, i) => (
                        <div
                            key={i}
                            style={{
                                backgroundColor: theme.bg.card,
                                borderRadius: 12,
                                padding: '20px 24px',
                                flex: '1 1 180px',
                                minWidth: 160,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                border: `1px solid ${theme.border.primary}`,
                            }}
                        >
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    backgroundColor: stat.bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <stat.icon size={22} color="#fff" />
                            </div>
                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                <p style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: theme.text.primary,
                                    margin: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {stat.value}
                                </p>
                                <p style={{ fontSize: 12, color: theme.text.secondary, margin: '2px 0 0', whiteSpace: 'nowrap' }}>
                                    {stat.label}
                                </p>
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
                    {/* Search & Filters Bar */}
                    <div
                        style={{
                            padding: '16px 20px',
                            borderBottom: `1px solid ${theme.border.primary}`,
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        {/* Search */}
                        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 400 }}>
                            <Search
                                size={16}
                                color={theme.text.secondary}
                                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                            />
                            <input
                                type="text"
                                placeholder="Search by email, project or organization name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 40px',
                                    border: `1px solid ${theme.border.primary}`,
                                    borderRadius: 8,
                                    backgroundColor: theme.bg.app,
                                    color: theme.text.primary,
                                    fontSize: 13,
                                    outline: 'none',
                                }}
                            />
                        </div>

                        {/* Search Button */}
                        <button
                            style={{
                                padding: '10px 20px',
                                backgroundColor: mode === 'Dark' ? '#374151' : '#1F2937',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            <Search size={14} />
                            Search
                        </button>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
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
                            <Filter size={14} />
                            Filter
                            <ChevronDown size={14} />
                        </button>

                        {/* Filter Pills */}
                        {dateFilter && (
                            <span
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#DBEAFE',
                                    color: '#1E40AF',
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <Calendar size={12} />
                                Date
                                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setDateFilter('')} />
                            </span>
                        )}

                        {statusFilter && (
                            <span
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#D1FAE5',
                                    color: '#065F46',
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                Status
                                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('')} />
                            </span>
                        )}

                        {cityFilter && (
                            <span
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#FEF3C7',
                                    color: '#92400E',
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                Organization
                                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setCityFilter('')} />
                            </span>
                        )}

                        {/* Spacer */}
                        <div style={{ flex: 1 }} />

                        {/* Export */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, color: theme.text.secondary }}>Current Report</span>
                            <button
                                onClick={exportToCSV}
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
                                PDF
                                <ChevronDown size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Dropdowns (expandable) */}
                    {showFilters && (
                        <div
                            style={{
                                padding: '12px 20px',
                                borderBottom: `1px solid ${theme.border.primary}`,
                                display: 'flex',
                                gap: 16,
                                alignItems: 'center',
                                backgroundColor: theme.bg.app,
                            }}
                        >
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: `1px solid ${theme.border.primary}`,
                                    borderRadius: 6,
                                    backgroundColor: theme.bg.card,
                                    color: theme.text.primary,
                                    fontSize: 13,
                                }}
                            >
                                <option value="">All Time</option>
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="90days">Last 90 Days</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: `1px solid ${theme.border.primary}`,
                                    borderRadius: 6,
                                    backgroundColor: theme.bg.card,
                                    color: theme.text.primary,
                                    fontSize: 13,
                                }}
                            >
                                <option value="">All Status</option>
                                <option value="enabled">Enabled</option>
                                <option value="disabled">Disabled</option>
                            </select>

                            <select
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: `1px solid ${theme.border.primary}`,
                                    borderRadius: 6,
                                    backgroundColor: theme.bg.card,
                                    color: theme.text.primary,
                                    fontSize: 13,
                                }}
                            >
                                <option value="">All Cities</option>
                                {uniqueCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#EF4444',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        fontSize: 12,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    )}

                    {/* Items per page */}
                    <div
                        style={{
                            padding: '12px 20px',
                            borderBottom: `1px solid ${theme.border.primary}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 13,
                            color: theme.text.secondary,
                        }}
                    >
                        Show
                        <select
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            style={{
                                padding: '4px 8px',
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 4,
                                backgroundColor: theme.bg.card,
                                color: theme.text.primary,
                                fontSize: 13,
                            }}
                        >
                            <option value={10}>10 Items</option>
                            <option value={25}>25 Items</option>
                            <option value={50}>50 Items</option>
                            <option value={100}>100 Items</option>
                        </select>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div style={{ padding: 48, textAlign: 'center' }}>
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    border: `3px solid ${theme.border.primary}`,
                                    borderTop: `3px solid ${theme.accent.primary}`,
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 16px',
                                }}
                            />
                            <p style={{ fontSize: 14, color: theme.text.secondary }}>Loading customers...</p>
                        </div>
                    ) : error ? (
                        <div style={{ padding: 48, textAlign: 'center' }}>
                            <p style={{ fontSize: 14, color: '#EF4444' }}>{error}</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ backgroundColor: theme.bg.app }}>
                                        <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>
                                            Serial
                                        </th>
                                        <th
                                            onClick={() => handleSort('name')}
                                            style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}`, cursor: 'pointer' }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                                Customer Name <SortIcon field="name" />
                                            </span>
                                        </th>
                                        <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>
                                            Email
                                        </th>
                                        <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>
                                            City
                                        </th>
                                        <th
                                            onClick={() => handleSort('total_orders')}
                                            style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}`, cursor: 'pointer' }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                Orders <SortIcon field="total_orders" />
                                            </span>
                                        </th>
                                        <th
                                            onClick={() => handleSort('total_spent')}
                                            style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}`, cursor: 'pointer' }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                Total Spent <SortIcon field="total_spent" />
                                            </span>
                                        </th>
                                        <th
                                            onClick={() => handleSort('last_order_date')}
                                            style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}`, cursor: 'pointer' }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                Date <SortIcon field="last_order_date" />
                                            </span>
                                        </th>
                                        <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: theme.text.secondary }}>
                                                No customers found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedCustomers.map((customer, index) => (
                                            <React.Fragment key={customer.id}>
                                                <tr
                                                    onClick={() => setExpandedRow(expandedRow === customer.id ? null : customer.id)}
                                                    style={{
                                                        backgroundColor: expandedRow === customer.id ? theme.bg.app : 'transparent',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.15s',
                                                    }}
                                                >
                                                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, color: theme.text.secondary }}>
                                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, color: theme.text.primary, fontWeight: 500 }}>
                                                        {customer.name || 'غير معروف'}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, color: theme.text.secondary }}>
                                                        {customer.email || '-'}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, color: theme.text.secondary }}>
                                                        {customer.address?.city || '-'}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, color: theme.accent.primary, fontWeight: 600, textAlign: 'center' }}>
                                                        + {customer.total_orders}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, textAlign: 'right' }}>
                                                        <span style={{ color: '#10B981', fontWeight: 600 }}>
                                                            {formatCurrency(customer.total_spent, customer.currency)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, color: theme.text.secondary, textAlign: 'center' }}>
                                                        {formatDate(customer.last_order_date)}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, textAlign: 'center' }}>
                                                        <span
                                                            style={{
                                                                padding: '4px 12px',
                                                                borderRadius: 4,
                                                                fontSize: 11,
                                                                fontWeight: 500,
                                                                backgroundColor: customer.status === 'enabled' ? '#D1FAE5' : '#FEE2E2',
                                                                color: customer.status === 'enabled' ? '#065F46' : '#991B1B',
                                                            }}
                                                        >
                                                            {customer.status === 'enabled' ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                </tr>

                                                {/* Expanded Details Row */}
                                                {expandedRow === customer.id && (
                                                    <tr>
                                                        <td colSpan={8} style={{ padding: 0, borderBottom: `1px solid ${theme.border.primary}`, backgroundColor: theme.bg.app }}>
                                                            <div style={{ padding: '16px 32px', display: 'flex', gap: 48 }}>
                                                                <div>
                                                                    <p style={{ fontSize: 11, color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>Phone</p>
                                                                    <p style={{ fontSize: 13, color: theme.text.primary }} dir="ltr">{customer.phone || 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <p style={{ fontSize: 11, color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>Address</p>
                                                                    <p style={{ fontSize: 13, color: theme.text.primary }}>
                                                                        {customer.address?.address1 || 'N/A'}
                                                                        {customer.address?.address2 && `, ${customer.address.address2}`}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p style={{ fontSize: 11, color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>Province</p>
                                                                    <p style={{ fontSize: 13, color: theme.text.primary }}>{customer.address?.province || 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <p style={{ fontSize: 11, color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>Country</p>
                                                                    <p style={{ fontSize: 13, color: theme.text.primary }}>{customer.address?.country} ({customer.address?.country_code})</p>
                                                                </div>
                                                                <div>
                                                                    <p style={{ fontSize: 11, color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>Created</p>
                                                                    <p style={{ fontSize: 13, color: theme.text.primary }}>{formatDate(customer.created_at)}</p>
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

                    {/* Pagination */}
                    {!loading && !error && filteredCustomers.length > 0 && (
                        <div
                            style={{
                                padding: '16px 20px',
                                borderTop: `1px solid ${theme.border.primary}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <p style={{ fontSize: 13, color: theme.text.secondary }}>
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} entries
                            </p>

                            <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '6px 12px',
                                        border: `1px solid ${theme.border.primary}`,
                                        borderRadius: 4,
                                        backgroundColor: 'transparent',
                                        color: theme.text.primary,
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        opacity: currentPage === 1 ? 0.5 : 1,
                                    }}
                                >
                                    Prev
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            style={{
                                                padding: '6px 12px',
                                                border: `1px solid ${currentPage === page ? theme.accent.primary : theme.border.primary}`,
                                                borderRadius: 4,
                                                backgroundColor: currentPage === page ? theme.accent.primary : 'transparent',
                                                color: currentPage === page ? '#fff' : theme.text.primary,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '6px 12px',
                                        border: `1px solid ${theme.border.primary}`,
                                        borderRadius: 4,
                                        backgroundColor: 'transparent',
                                        color: theme.text.primary,
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        opacity: currentPage === totalPages ? 0.5 : 1,
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
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
