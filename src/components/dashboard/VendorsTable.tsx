import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import {
    Download,
    Plus,
    MoreHorizontal,
    ChevronUp,
    ChevronDown,
    Loader2,
} from 'lucide-react';
import { VendorDetailDrawer } from './VendorDetailDrawer';
import { getVendorStatusColor } from '../../services/vendorService';
import { formatCurrency } from '../../services/dashboardApi';
import type { VendorWithStats } from '../../types/accountsPayable';

interface VendorsTableProps {
    vendors: VendorWithStats[];
    isLoading: boolean;
    onRefresh: () => void;
}

type SortField = 'name' | 'total_purchase' | 'total_paid' | 'total_outstanding' | 'last_invoice_date';
type SortDirection = 'asc' | 'desc';

export const VendorsTable: React.FC<VendorsTableProps> = ({ vendors, isLoading, onRefresh }) => {
    const { theme, mode } = useTheme();
    const [selectedVendor, setSelectedVendor] = useState<VendorWithStats | null>(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedVendors = [...vendors].sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        if (sortField === 'last_invoice_date') {
            aVal = aVal ? new Date(aVal).getTime() : 0;
            bVal = bVal ? new Date(bVal).getTime() : 0;
        }

        if (typeof aVal === 'string') {
            return sortDirection === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    const paginatedVendors = sortedVendors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(sortedVendors.length / itemsPerPage);

    const handleVendorClick = (vendor: VendorWithStats) => {
        setSelectedVendor(vendor);
        setShowDrawer(true);
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc'
            ? <ChevronUp size={14} style={{ marginLeft: '4px' }} />
            : <ChevronDown size={14} style={{ marginLeft: '4px' }} />;
    };

    const headerStyle = (field: SortField) => ({
        padding: '16px',
        backgroundColor: theme.bg.hover,
        color: theme.text.secondary,
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        borderBottom: `1px solid ${theme.border.primary}`,
        whiteSpace: 'nowrap' as const,
        cursor: 'pointer',
        userSelect: 'none' as const,
        display: 'flex',
        alignItems: 'center',
    });

    const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                backgroundColor: theme.bg.card,
                borderRadius: '16px',
                padding: '24px',
                border: `1px solid ${theme.border.primary}`,
                boxShadow: mode === 'Dark' ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
            }}
        >
            {/* Table Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 style={{ color: theme.text.primary, fontSize: '18px', fontWeight: 600, margin: 0 }}>
                    Vendors & Suppliers
                </h3>

                <div className="flex flex-wrap gap-3">
                    {/* Export Button */}
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 16px', borderRadius: '12px',
                        border: `1px solid ${theme.border.primary}`,
                        backgroundColor: theme.bg.card,
                        color: theme.text.secondary,
                        fontSize: '14px', fontWeight: 500,
                        cursor: 'pointer'
                    }}>
                        <Download size={18} />
                        Export
                    </button>

                    {/* Add Vendor Button */}
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 20px', borderRadius: '12px',
                        border: 'none',
                        backgroundColor: theme.accent.primary,
                        color: '#FFF',
                        fontSize: '14px', fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(15, 118, 110, 0.25)'
                    }}>
                        <Plus size={18} />
                        Add Vendor
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '60px',
                    color: theme.text.muted,
                }}>
                    <Loader2 size={32} className="animate-spin" />
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead>
                                <tr style={{ textAlign: 'left' }}>
                                    <th
                                        onClick={() => handleSort('name')}
                                        style={{ ...headerStyle('name'), borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}
                                    >
                                        Vendor Name <SortIcon field="name" />
                                    </th>
                                    <th style={{ ...headerStyle('name'), cursor: 'default' }}>
                                        Total Invoices
                                    </th>
                                    <th
                                        onClick={() => handleSort('total_purchase')}
                                        style={headerStyle('total_purchase')}
                                    >
                                        Total Purchase <SortIcon field="total_purchase" />
                                    </th>
                                    <th
                                        onClick={() => handleSort('total_paid')}
                                        style={headerStyle('total_paid')}
                                    >
                                        Paid <SortIcon field="total_paid" />
                                    </th>
                                    <th
                                        onClick={() => handleSort('total_outstanding')}
                                        style={headerStyle('total_outstanding')}
                                    >
                                        Outstanding <SortIcon field="total_outstanding" />
                                    </th>
                                    <th
                                        onClick={() => handleSort('last_invoice_date')}
                                        style={headerStyle('last_invoice_date')}
                                    >
                                        Last Invoice <SortIcon field="last_invoice_date" />
                                    </th>
                                    <th style={{ ...headerStyle('name'), cursor: 'default' }}>
                                        Payment Terms
                                    </th>
                                    <th style={{ ...headerStyle('name'), cursor: 'default' }}>
                                        Status
                                    </th>
                                    <th style={{ ...headerStyle('name'), cursor: 'default', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedVendors.map((vendor) => {
                                    const statusColors = getVendorStatusColor(vendor.status);
                                    return (
                                        <tr
                                            key={vendor.id}
                                            style={{
                                                borderBottom: `1px solid ${theme.border.subtle}`,
                                                transition: 'background-color 0.2s',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleVendorClick(vendor)}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bg.hover}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '16px', color: theme.text.primary, fontWeight: 600, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                <div>
                                                    <span style={{ color: theme.accent.primary }}>{vendor.name}</span>
                                                    {vendor.contact_person && (
                                                        <p style={{ fontSize: '12px', color: theme.text.muted, margin: '2px 0 0' }}>
                                                            {vendor.contact_person}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', color: theme.text.secondary, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                {vendor.total_invoices}
                                            </td>
                                            <td style={{ padding: '16px', color: theme.text.primary, fontWeight: 600, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                {formatCurrency(vendor.total_purchase)}
                                            </td>
                                            <td style={{ padding: '16px', color: '#166534', fontWeight: 500, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                {formatCurrency(vendor.total_paid)}
                                            </td>
                                            <td style={{ padding: '16px', color: vendor.total_outstanding > 0 ? '#EF4444' : theme.text.secondary, fontWeight: 500, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                {formatCurrency(vendor.total_outstanding)}
                                            </td>
                                            <td style={{ padding: '16px', color: theme.text.secondary, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                {formatDate(vendor.last_invoice_date)}
                                            </td>
                                            <td style={{ padding: '16px', color: theme.text.secondary, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                Net {vendor.payment_terms_days}
                                            </td>
                                            <td style={{ padding: '16px', borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    backgroundColor: mode === 'Dark' ? statusColors.darkBg : statusColors.bg,
                                                    color: statusColors.text,
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    display: 'inline-block'
                                                }}>
                                                    {formatStatus(vendor.status)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleVendorClick(vendor); }}
                                                    style={{ padding: '6px', cursor: 'pointer', borderRadius: '6px', border: 'none', backgroundColor: 'transparent' }}
                                                    title="View Details"
                                                >
                                                    <MoreHorizontal size={16} color={theme.text.muted} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '24px',
                        padding: '0 8px',
                    }}>
                        <span style={{ fontSize: '13px', color: theme.text.muted }}>
                            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedVendors.length)} of {sortedVendors.length} vendors
                        </span>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: `1px solid ${theme.border.primary}`,
                                    backgroundColor: theme.bg.card,
                                    color: currentPage === 1 ? theme.text.muted : theme.text.primary,
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                }}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: `1px solid ${theme.border.primary}`,
                                    backgroundColor: theme.bg.card,
                                    color: currentPage === totalPages ? theme.text.muted : theme.text.primary,
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.5 : 1,
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Vendor Detail Drawer */}
            <VendorDetailDrawer
                isOpen={showDrawer}
                onClose={() => setShowDrawer(false)}
                vendor={selectedVendor}
                onRefresh={onRefresh}
            />
        </motion.div>
    );
};
