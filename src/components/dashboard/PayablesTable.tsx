import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Trash2,
    Check,
    X,
    MoreHorizontal,
    ChevronDown,
    RefreshCw,
    Download,
    Upload,
    Settings2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
    fetchPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase,
    getStatusColor,
    formatCurrencyValue,
    fetchVendors,
} from '../../services/vendorService';
import { DEFAULT_PAYABLES_COLUMNS } from '../../types/accountsPayable';
import type { PurchaseRecord, TableColumn, Vendor, PurchaseStatus, CreatePurchaseInput } from '../../types/accountsPayable';

interface PayablesTableProps {
    onRowClick: (purchase: PurchaseRecord) => void;
    onRefresh: () => void;
    filterStatus?: PurchaseStatus;
    searchTerm?: string;
}

export const PayablesTable: React.FC<PayablesTableProps> = ({
    onRowClick,
    onRefresh,
    filterStatus,
    searchTerm,
}) => {
    const { theme, mode } = useTheme();
    const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [columns, setColumns] = useState<TableColumn[]>(DEFAULT_PAYABLES_COLUMNS);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCell, setEditingCell] = useState<{ rowId: string; columnKey: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [showAddRow, setShowAddRow] = useState(false);
    const [newRow, setNewRow] = useState<Partial<CreatePurchaseInput>>({});
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [purchasesData, vendorsData] = await Promise.all([
                fetchPurchases(),
                fetchVendors(),
            ]);
            setPurchases(purchasesData);
            setVendors(vendorsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter purchases
    const filteredPurchases = purchases.filter(p => {
        if (filterStatus && p.status !== filterStatus) return false;
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                p.vendor_name.toLowerCase().includes(search) ||
                p.product_name.toLowerCase().includes(search) ||
                p.notes?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    // Calculate totals
    const totals = {
        total_cost: filteredPurchases.reduce((sum, p) => sum + p.total_cost, 0),
        paid_amount: filteredPurchases.reduce((sum, p) => sum + p.paid_amount, 0),
        outstanding_amount: filteredPurchases.reduce((sum, p) => sum + p.outstanding_amount, 0),
    };

    // Handle cell editing
    const handleCellClick = (rowId: string, columnKey: string, value: any) => {
        const column = columns.find(c => c.key === columnKey);
        if (column?.isCalculated || !column?.isEditable) return;

        setEditingCell({ rowId, columnKey });
        setEditValue(String(value ?? ''));
    };

    const handleCellSave = async () => {
        if (!editingCell) return;

        const { rowId, columnKey } = editingCell;
        const column = columns.find(c => c.key === columnKey);

        let parsedValue: any = editValue;
        if (column?.type === 'number' || column?.type === 'currency') {
            parsedValue = parseFloat(editValue) || 0;
        } else if (column?.type === 'boolean') {
            parsedValue = editValue.toLowerCase() === 'yes' || editValue === 'true';
        }

        try {
            await updatePurchase(rowId, { [columnKey]: parsedValue });
            await loadData();
            onRefresh();
        } catch (error) {
            console.error('Error saving cell:', error);
        }

        setEditingCell(null);
        setEditValue('');
    };

    const handleCellCancel = () => {
        setEditingCell(null);
        setEditValue('');
    };

    // Handle row addition
    const handleAddRow = async () => {
        if (!newRow.vendor_id || !newRow.product_name || !newRow.purchase_price || !newRow.quantity) {
            return;
        }

        try {
            await createPurchase(newRow as CreatePurchaseInput);
            await loadData();
            onRefresh();
            setShowAddRow(false);
            setNewRow({});
            setSelectedVendor(null);
        } catch (error) {
            console.error('Error adding row:', error);
        }
    };

    const handleDeleteRow = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this record?')) return;

        try {
            await deletePurchase(id);
            await loadData();
            onRefresh();
        } catch (error) {
            console.error('Error deleting row:', error);
        }
    };

    // Render cell value
    const renderCellValue = (purchase: PurchaseRecord, column: TableColumn) => {
        const value = (purchase as any)[column.key];
        const isEditing = editingCell?.rowId === purchase.id && editingCell?.columnKey === column.key;

        if (isEditing) {
            if (column.type === 'select' && column.options) {
                return (
                    <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleCellSave}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: `2px solid ${theme.accent.primary}`,
                            backgroundColor: theme.bg.app,
                            color: theme.text.primary,
                            outline: 'none',
                        }}
                    >
                        {column.options.map(opt => (
                            <option key={opt} value={opt.toLowerCase().replace(' ', '_')}>{opt}</option>
                        ))}
                    </select>
                );
            }

            if (column.type === 'boolean') {
                return (
                    <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleCellSave}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: `2px solid ${theme.accent.primary}`,
                            backgroundColor: theme.bg.app,
                            color: theme.text.primary,
                            outline: 'none',
                        }}
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                );
            }

            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                        type={column.type === 'number' || column.type === 'currency' ? 'number' : column.type === 'date' ? 'date' : 'text'}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellSave();
                            if (e.key === 'Escape') handleCellCancel();
                        }}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: `2px solid ${theme.accent.primary}`,
                            backgroundColor: theme.bg.app,
                            color: theme.text.primary,
                            outline: 'none',
                        }}
                    />
                    <button onClick={handleCellSave} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Check size={14} color="#22C55E" />
                    </button>
                    <button onClick={handleCellCancel} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={14} color="#EF4444" />
                    </button>
                </div>
            );
        }

        // Display mode
        switch (column.type) {
            case 'currency':
                return formatCurrencyValue(value || 0);
            case 'boolean':
                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: value
                            ? (mode === 'Dark' ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7')
                            : (mode === 'Dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2'),
                        color: value ? '#22C55E' : '#EF4444',
                        fontSize: '12px',
                        fontWeight: 600,
                    }}>
                        {value ? 'Yes' : 'No'}
                    </span>
                );
            case 'date':
                return value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
            case 'select':
                if (column.key === 'status') {
                    const statusColors = getStatusColor(value);
                    return (
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            backgroundColor: mode === 'Dark' ? statusColors.darkBg : statusColors.bg,
                            color: statusColors.text,
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                        }}>
                            {(value || '').replace('_', ' ')}
                        </span>
                    );
                }
                return value || '-';
            default:
                return value || '-';
        }
    };

    const headerStyle = {
        padding: '14px 16px',
        textAlign: 'left' as const,
        fontSize: '12px',
        fontWeight: 600,
        color: theme.text.muted,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
        borderBottom: `1px solid ${theme.border.primary}`,
    };

    const cellStyle = {
        padding: '14px 16px',
        fontSize: '14px',
        color: theme.text.primary,
        borderBottom: `1px solid ${theme.border.subtle}`,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                backgroundColor: theme.bg.card,
                borderRadius: '20px',
                border: `1px solid ${theme.border.primary}`,
                overflow: 'hidden',
            }}
        >
            {/* Table Header */}
            <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${theme.border.primary}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>
                        Payables
                    </h3>
                    <p style={{ fontSize: '13px', color: theme.text.muted, margin: '4px 0 0' }}>
                        {filteredPurchases.length} records • Outstanding: {formatCurrencyValue(totals.outstanding_amount)}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowAddRow(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: theme.accent.primary,
                            color: '#FFF',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        <Plus size={16} />
                        Add Row
                    </button>
                    <button
                        onClick={loadData}
                        style={{
                            padding: '10px',
                            borderRadius: '10px',
                            border: `1px solid ${theme.border.primary}`,
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                        }}
                    >
                        <RefreshCw size={16} color={theme.text.muted} />
                    </button>
                </div>
            </div>

            {/* Add Row Form */}
            {showAddRow && (
                <div style={{
                    padding: '16px 24px',
                    backgroundColor: mode === 'Dark' ? 'rgba(15, 118, 110, 0.1)' : '#E6FAF8',
                    borderBottom: `1px solid ${theme.border.primary}`,
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}>
                    <select
                        value={newRow.vendor_id || ''}
                        onChange={(e) => {
                            const vendor = vendors.find(v => v.id === e.target.value);
                            setSelectedVendor(vendor || null);
                            setNewRow({ ...newRow, vendor_id: e.target.value, vendor_name: vendor?.name || '' });
                        }}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.border.primary}`,
                            backgroundColor: theme.bg.app,
                            color: theme.text.primary,
                            fontSize: '13px',
                            minWidth: '180px',
                        }}
                    >
                        <option value="">Select Vendor</option>
                        {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={newRow.product_name || ''}
                        onChange={(e) => setNewRow({ ...newRow, product_name: e.target.value })}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.border.primary}`,
                            backgroundColor: theme.bg.app,
                            color: theme.text.primary,
                            fontSize: '13px',
                            minWidth: '180px',
                        }}
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={newRow.purchase_price || ''}
                        onChange={(e) => setNewRow({ ...newRow, purchase_price: parseFloat(e.target.value) || 0 })}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.border.primary}`,
                            backgroundColor: theme.bg.app,
                            color: theme.text.primary,
                            fontSize: '13px',
                            width: '100px',
                        }}
                    />
                    <input
                        type="number"
                        placeholder="Qty"
                        value={newRow.quantity || ''}
                        onChange={(e) => setNewRow({ ...newRow, quantity: parseInt(e.target.value) || 0 })}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.border.primary}`,
                            backgroundColor: theme.bg.app,
                            color: theme.text.primary,
                            fontSize: '13px',
                            width: '80px',
                        }}
                    />
                    <button
                        onClick={handleAddRow}
                        disabled={!newRow.vendor_id || !newRow.product_name || !newRow.purchase_price || !newRow.quantity}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#22C55E',
                            color: '#FFF',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            opacity: (!newRow.vendor_id || !newRow.product_name || !newRow.purchase_price || !newRow.quantity) ? 0.5 : 1,
                        }}
                    >
                        <Check size={16} />
                    </button>
                    <button
                        onClick={() => { setShowAddRow(false); setNewRow({}); }}
                        style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.border.primary}`,
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                        }}
                    >
                        <X size={16} color={theme.text.muted} />
                    </button>
                </div>
            )}

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                    <thead>
                        <tr>
                            {columns.filter(c => c.isVisible).map((column, index) => (
                                <th
                                    key={column.id}
                                    style={{
                                        ...headerStyle,
                                        borderTopLeftRadius: index === 0 ? '0' : '0',
                                    }}
                                >
                                    {column.label}
                                    {column.isCalculated && (
                                        <span style={{ marginLeft: '4px', opacity: 0.5 }}>⚡</span>
                                    )}
                                </th>
                            ))}
                            <th style={{ ...headerStyle, width: '60px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.filter(c => c.isVisible).length + 1} style={{ ...cellStyle, textAlign: 'center', padding: '40px' }}>
                                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto', color: theme.text.muted }} />
                                </td>
                            </tr>
                        ) : filteredPurchases.length === 0 ? (
                            <tr>
                                <td colSpan={columns.filter(c => c.isVisible).length + 1} style={{ ...cellStyle, textAlign: 'center', padding: '40px' }}>
                                    <p style={{ color: theme.text.muted, margin: 0 }}>No records found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredPurchases.map((purchase) => (
                                <tr
                                    key={purchase.id}
                                    onClick={() => onRowClick(purchase)}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'background-color 0.15s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = theme.bg.hover;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {columns.filter(c => c.isVisible).map((column) => (
                                        <td
                                            key={column.id}
                                            onClick={(e) => {
                                                if (column.isEditable && !column.isCalculated) {
                                                    e.stopPropagation();
                                                    handleCellClick(purchase.id, column.key, (purchase as any)[column.key]);
                                                }
                                            }}
                                            style={{
                                                ...cellStyle,
                                                fontWeight: column.key === 'vendor_name' ? 600 : 400,
                                                cursor: column.isEditable && !column.isCalculated ? 'text' : 'pointer',
                                            }}
                                        >
                                            {renderCellValue(purchase, column)}
                                        </td>
                                    ))}
                                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                                        <button
                                            onClick={(e) => handleDeleteRow(purchase.id, e)}
                                            style={{
                                                padding: '6px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Trash2 size={14} color={theme.text.muted} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {/* Totals Row */}
                    {filteredPurchases.length > 0 && (
                        <tfoot>
                            <tr style={{ backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}>
                                {columns.filter(c => c.isVisible).map((column, index) => (
                                    <td
                                        key={column.id}
                                        style={{
                                            ...cellStyle,
                                            fontWeight: 700,
                                            borderBottom: 'none',
                                        }}
                                    >
                                        {index === 0 ? 'TOTAL' :
                                            column.key === 'total_cost' ? formatCurrencyValue(totals.total_cost) :
                                                column.key === 'paid_amount' ? formatCurrencyValue(totals.paid_amount) :
                                                    column.key === 'outstanding_amount' ? formatCurrencyValue(totals.outstanding_amount) :
                                                        ''}
                                    </td>
                                ))}
                                <td style={{ ...cellStyle, borderBottom: 'none' }}></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </motion.div>
    );
};
