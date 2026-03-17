import React, { useState, useEffect, useMemo } from 'react';
import { useUpload } from '../context/UploadContext';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import {
    Search,
    Upload,
    Download,
    Calendar,
    ChevronDown,
    MoreHorizontal,
    Facebook,
    Globe,
    Smartphone,
    TrendingUp,
    DollarSign,
    BarChart3,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Ad interface for real data from webhook
interface Ad {
    id: string;
    name: string;
    campaign: string;
    platform: 'Meta' | 'Google' | 'TikTok';
    status: 'active' | 'paused' | 'completed' | 'draft';
    spend: number;
    revenue: number;
    roas: number;
    impressions: number;
    clicks: number;
    startDate: string;
    endDate?: string | null;
}

type StatusFilter = 'all' | 'active' | 'paused' | 'completed';
type PlatformFilter = 'all' | 'Meta' | 'Google' | 'TikTok';

export const AdsPerformance: React.FC = () => {
    const { openUpload } = useUpload();
    const { user, session } = useAuth();

    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');

    useEffect(() => {
        const fetchAdsData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

                const response = await fetch(`${supabaseUrl}/functions/v1/order-performance-proxy`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: user.id }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setAds(data);
                    } else {
                        setAds([]);
                    }
                } else {
                    setError('Failed to load ads data');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load ads data');
            } finally {
                setLoading(false);
            }
        };

        fetchAdsData();
    }, [user?.id, session?.access_token]);

    // KPI Calculations
    const kpis = useMemo(() => {
        const totalSpend = ads.reduce((sum, ad) => sum + (ad.spend || 0), 0);
        const totalRevenue = ads.reduce((sum, ad) => sum + (ad.revenue || 0), 0);
        const avgRoas = ads.length > 0
            ? ads.reduce((sum, ad) => sum + (ad.roas || 0), 0) / ads.length
            : 0;
        const activeCampaigns = ads.filter(ad => ad.status === 'active').length;

        return { totalSpend, totalRevenue, avgRoas, activeCampaigns };
    }, [ads]);

    // Filtered Ads
    const filteredAds = useMemo(() => {
        return ads.filter(ad => {
            const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
            const matchesPlatform = platformFilter === 'all' || ad.platform === platformFilter;
            const matchesSearch = ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ad.campaign.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesPlatform && matchesSearch;
        });
    }, [ads, statusFilter, platformFilter, searchQuery]);

    const formatCurrency = (value: number) => {
        if (value === 0) return <span style={{ color: '#cbd5e1' }}>—</span>;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatNumber = (num: number) => {
        if (num === 0) return <span style={{ color: '#cbd5e1' }}>—</span>;
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
    };

    const getRoasColor = (roas: number) => {
        if (roas >= 2) return 'text-emerald-600 bg-emerald-50';
        if (roas >= 1) return 'text-amber-600 bg-amber-50';
        if (roas > 0) return 'text-rose-600 bg-rose-50';
        return 'text-slate-400';
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const getStatusStyles = (s: string): React.CSSProperties => {
            switch (s) {
                case 'active':
                    return { background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 };
                case 'paused':
                    return { background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 };
                case 'completed':
                    return { background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 };
                default:
                    return { background: '#f8fafc', color: '#94a3b8', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 };
            }
        };

        return (
            <span style={getStatusStyles(status)} className="capitalize">
                {status}
            </span>
        );
    };

    const PlatformIcon = ({ platform }: { platform: string }) => {
        switch (platform) {
            case 'Meta': return <Facebook size={14} className="text-[#1877F2]" />;
            case 'Google': return <Globe size={14} className="text-[#4285F4]" />;
            case 'TikTok': return <Smartphone size={14} className="text-slate-800 dark:text-white" />;
            default: return <Globe size={14} className="text-slate-400" />;
        }
    };

    // KPI Card Component
    const KpiCard = ({ icon: Icon, label, value, subtext, iconBg }: {
        icon: React.ElementType;
        label: string;
        value: string | number;
        subtext?: string;
        iconBg: string;
    }) => (
        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '14px', boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
            <div className="flex items-start justify-between">
                <div>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>{label}</p>
                    <p style={{ fontSize: '22px', fontWeight: 600 }}>{value}</p>
                    {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
                </div>
                <div className={`p-2.5 rounded-lg ${iconBg}`}>
                    <Icon size={20} className="text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="min-h-screen" style={{ padding: '24px 28px', background: '#f8fafc' }}>
                <div className="max-w-[1440px] mx-auto">

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center min-h-[500px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-emerald-500 mx-auto mb-4"></div>
                                <p className="text-slate-500 text-sm">Loading performance data...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="flex items-center justify-center min-h-[500px]">
                            <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Target className="text-rose-500" size={24} />
                                </div>
                                <p className="text-slate-900 font-medium mb-2">Unable to load data</p>
                                <p className="text-slate-500 text-sm mb-4">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    {!loading && !error && (
                        <div className="space-y-6">

                            {/* Page Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div>
                                    <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a' }}>
                                        Ads Performance
                                    </h1>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                                        Campaign visibility & profitability analytics
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={openUpload}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 500, borderRadius: '10px', fontSize: '14px' }}
                                    >
                                        <Upload size={16} />
                                        <span>Upload</span>
                                    </button>
                                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 500, borderRadius: '10px', fontSize: '14px' }}>
                                        <Calendar size={16} />
                                        <span>This Month</span>
                                        <ChevronDown size={14} style={{ opacity: 0.5 }} />
                                    </button>
                                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 500, borderRadius: '10px', fontSize: '14px' }}>
                                        <Download size={16} />
                                        <span>Export</span>
                                    </button>
                                </div>
                            </div>

                            {/* KPI Summary Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                <KpiCard
                                    icon={DollarSign}
                                    label="Total Spend"
                                    value={`$${kpis.totalSpend.toLocaleString()}`}
                                    iconBg="bg-gradient-to-br from-rose-400 to-rose-500"
                                />
                                <KpiCard
                                    icon={TrendingUp}
                                    label="Total Revenue"
                                    value={`$${kpis.totalRevenue.toLocaleString()}`}
                                    iconBg="bg-gradient-to-br from-emerald-400 to-emerald-500"
                                />
                                <KpiCard
                                    icon={BarChart3}
                                    label="Avg ROAS"
                                    value={`${kpis.avgRoas.toFixed(2)}x`}
                                    subtext={kpis.avgRoas >= 2 ? "Healthy" : kpis.avgRoas >= 1 ? "Break-even" : "Below target"}
                                    iconBg="bg-gradient-to-br from-violet-400 to-violet-500"
                                />
                                <KpiCard
                                    icon={Target}
                                    label="Active Campaigns"
                                    value={kpis.activeCampaigns}
                                    subtext={`of ${ads.length} total`}
                                    iconBg="bg-gradient-to-br from-blue-400 to-blue-500"
                                />
                            </div>

                            {/* Filter Bar */}
                            <div style={{ display: 'flex', gap: '12px', padding: '14px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
                                <div className="flex flex-wrap items-center gap-3 w-full">
                                    {/* Search */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            placeholder="Search campaigns..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ width: '100%', paddingLeft: '36px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#334155', outline: 'none' }}
                                        />
                                    </div>

                                    <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }} className="hidden sm:block"></div>

                                    {/* Status Filter */}
                                    <div className="flex items-center gap-1.5">
                                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }} className="hidden md:block">Status:</span>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                            style={{ padding: '10px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#334155', outline: 'none' }}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="paused">Paused</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>

                                    {/* Platform Filter */}
                                    <div className="flex items-center gap-1.5">
                                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }} className="hidden md:block">Platform:</span>
                                        <select
                                            value={platformFilter}
                                            onChange={(e) => setPlatformFilter(e.target.value as PlatformFilter)}
                                            style={{ padding: '10px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#334155', outline: 'none' }}
                                        >
                                            <option value="all">All Platforms</option>
                                            <option value="Meta">Meta</option>
                                            <option value="Google">Google</option>
                                            <option value="TikTok">TikTok</option>
                                        </select>
                                    </div>

                                    <div className="flex-1"></div>

                                    {/* Results Count */}
                                    <span className="text-xs text-slate-500">
                                        {filteredAds.length} of {ads.length} campaigns
                                    </span>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div style={{ background: '#ffffff', borderRadius: '14px', overflow: 'hidden' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="sticky top-0 z-10">
                                            <tr>
                                                <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', textAlign: 'left' }}>Campaign</th>
                                                <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', textAlign: 'center' }}>Status</th>
                                                <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', textAlign: 'center' }}>Platform</th>
                                                <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', textAlign: 'right' }}>Spend</th>
                                                <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', textAlign: 'right' }}>Revenue</th>
                                                <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', textAlign: 'right' }}>ROAS</th>
                                                <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', textAlign: 'right' }}>Impr.</th>
                                                <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', textAlign: 'right' }}>Clicks</th>
                                                <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', width: '50px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <AnimatePresence>
                                                {filteredAds.length > 0 ? (
                                                    filteredAds.map((ad, index) => (
                                                        <motion.tr
                                                            key={ad.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ delay: index * 0.02 }}
                                                            className="group hover:bg-slate-50/50 transition-colors"
                                                        >
                                                            <td style={{ padding: '16px', fontSize: '14px', borderBottom: '1px solid #f1f5f9' }}>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                                                        {ad.name}
                                                                    </p>
                                                                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                                                                        {ad.id}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '16px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                                                <StatusBadge status={ad.status} />
                                                            </td>
                                                            <td style={{ padding: '16px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <div className="p-1.5 bg-slate-100 rounded-md">
                                                                        <PlatformIcon platform={ad.platform} />
                                                                    </div>
                                                                    <span className="text-xs font-medium text-slate-600 hidden lg:inline">
                                                                        {ad.platform}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '16px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 500, color: '#334155' }}>
                                                                {formatCurrency(ad.spend)}
                                                            </td>
                                                            <td style={{ padding: '16px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                                                                {formatCurrency(ad.revenue)}
                                                            </td>
                                                            <td style={{ padding: '16px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                                                                {ad.roas > 0 ? (
                                                                    <span className={`inline-flex px-2 py-0.5 rounded text-sm font-bold ${getRoasColor(ad.roas)}`}>
                                                                        {ad.roas.toFixed(2)}x
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: '#cbd5e1' }}>—</span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '16px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#475569' }}>
                                                                {formatNumber(ad.impressions)}
                                                            </td>
                                                            <td style={{ padding: '16px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#475569' }}>
                                                                {formatNumber(ad.clicks)}
                                                            </td>
                                                            <td style={{ padding: '16px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                                                                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                                                    <MoreHorizontal size={16} />
                                                                </button>
                                                            </td>
                                                        </motion.tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={9} className="py-16 text-center">
                                                            <div className="flex flex-col items-center justify-center gap-3">
                                                                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full">
                                                                    <BarChart3 size={24} className="text-slate-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-slate-900 dark:text-white">No campaigns found</p>
                                                                    <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search query</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
