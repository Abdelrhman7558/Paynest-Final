import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
    Plus,
    Settings2,
    Download,
    Search,
    Filter,
    X,
    Edit3,
    Trash2,
    DollarSign,
    TrendingDown,
    Clock,
    Layers,
} from 'lucide-react';

// ================== TYPES ==================

interface CostEntry {
    id: string;
    costName: string;
    amount: number;
    currency: string;
    type: 'Fixed' | 'Variable' | 'One-time';
    category: string;
    addedAt: string;
    notes?: string;
    [key: string]: any;
}

interface ColumnConfig {
    id: string;
    name: string;
    type: 'text' | 'number' | 'currency' | 'badge' | 'date' | 'dropdown';
    required?: boolean;
    locked?: boolean;
    options?: string[];
}

// ================== SAMPLE DATA ==================

const defaultColumns: ColumnConfig[] = [
    { id: 'costName', name: 'Cost Name', type: 'text', required: true, locked: true },
    { id: 'amount', name: 'Amount', type: 'currency', required: true, locked: true },
    { id: 'type', name: 'Type', type: 'badge', required: true },
    { id: 'category', name: 'Category', type: 'badge' },
    { id: 'addedAt', name: 'Added At', type: 'date', locked: true },
    { id: 'notes', name: 'Notes', type: 'text' },
];

const sampleCosts: CostEntry[] = [
    {
        id: '1',
        costName: 'Office Rent',
        amount: 5000,
        currency: 'EGP',
        type: 'Fixed',
        category: 'Operations',
        addedAt: new Date().toISOString(),
        notes: 'Monthly office space rental',
    },
    {
        id: '2',
        costName: 'Marketing Campaign',
        amount: 2500,
        currency: 'EGP',
        type: 'Variable',
        category: 'Marketing',
        addedAt: new Date(Date.now() - 86400000).toISOString(),
        notes: 'Facebook ads Q1',
    },
    {
        id: '3',
        costName: 'Software License',
        amount: 1200,
        currency: 'EGP',
        type: 'One-time',
        category: 'Technology',
        addedAt: new Date(Date.now() - 172800000).toISOString(),
    },
];

// ================== KPI CARD COMPONENT ==================

const KPICard: React.FC<{
    title: string;
    value: string | number;
    subtext?: string;
    icon: React.ReactNode;
    delay?: number;
    theme: any;
}> = ({ title, value, subtext, icon, delay = 0, theme }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: delay * 0.1 }}
            style={{
                backgroundColor: theme.bg.card,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: 12,
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: theme.text.secondary, margin: 0 }}>{title}</p>
                <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: theme.bg.hover,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {icon}
                </div>
            </div>
            <div>
                <h3 style={{ fontSize: 28, fontWeight: 700, color: theme.text.primary, margin: 0 }}>{value}</h3>
                {subtext && (
                    <p style={{ fontSize: 12, color: theme.text.muted, margin: '6px 0 0' }}>{subtext}</p>
                )}
            </div>
        </motion.div>
    );
};

// ================== BADGE COMPONENT ==================

const TypeBadge: React.FC<{ type: 'Fixed' | 'Variable' | 'One-time' }> = ({ type }) => {
    const colors = {
        Fixed: { bg: '#DBEAFE', text: '#1E40AF' },
        Variable: { bg: '#FEF3C7', text: '#92400E' },
        'One-time': { bg: '#F3F4F6', text: '#4B5563' },
    };
    const style = colors[type];
    return (
        <span style={{
            padding: '4px 10px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 500,
            backgroundColor: style.bg,
            color: style.text,
        }}>
            {type}
        </span>
    );
};

const CategoryBadge: React.FC<{ category: string; theme: any }> = ({ category, theme }) => {
    return (
        <span style={{
            padding: '4px 10px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 500,
            backgroundColor: theme.bg.hover,
            color: theme.text.secondary,
        }}>
            {category}
        </span>
    );
};

// ================== ADD COST MODAL ==================

const AddCostModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (cost: CostEntry) => void;
    columns: ColumnConfig[];
    editCost?: CostEntry | null;
    theme: any;
}> = ({ isOpen, onClose, onSave, columns: _columns, editCost, theme }) => {
    const [formData, setFormData] = useState<Record<string, any>>(
        editCost || {
            costName: '',
            amount: '',
            type: 'Fixed',
            category: '',
            notes: '',
        }
    );

    React.useEffect(() => {
        if (editCost) {
            setFormData(editCost);
        } else {
            setFormData({
                costName: '',
                amount: '',
                type: 'Fixed',
                category: '',
                notes: '',
            });
        }
    }, [editCost, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        const newCost: CostEntry = {
            id: editCost?.id || Date.now().toString(),
            costName: formData.costName || '',
            amount: parseFloat(formData.amount) || 0,
            currency: 'EGP',
            type: formData.type || 'Fixed',
            category: formData.category || 'General',
            addedAt: editCost?.addedAt || new Date().toISOString(),
            notes: formData.notes || '',
            ...formData,
        };
        onSave(newCost);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    backgroundColor: theme.bg.card,
                    borderRadius: 16,
                    padding: 32,
                    width: '100%',
                    maxWidth: 520,
                    maxHeight: '80vh',
                    overflow: 'auto',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                        {editCost ? 'Edit Cost' : 'Add New Cost'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <X size={20} color={theme.text.secondary} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Cost Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: theme.text.secondary, marginBottom: 6 }}>
                            Cost Name <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.costName || ''}
                            onChange={(e) => setFormData({ ...formData, costName: e.target.value })}
                            placeholder="e.g., Office Rent"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 8,
                                backgroundColor: theme.bg.app,
                                color: theme.text.primary,
                                fontSize: 14,
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: theme.text.secondary, marginBottom: 6 }}>
                            Amount <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.amount || ''}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 8,
                                backgroundColor: theme.bg.app,
                                color: theme.text.primary,
                                fontSize: 14,
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: theme.text.secondary, marginBottom: 6 }}>
                            Type <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <select
                            value={formData.type || 'Fixed'}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 8,
                                backgroundColor: theme.bg.app,
                                color: theme.text.primary,
                                fontSize: 14,
                                outline: 'none',
                            }}
                        >
                            <option value="Fixed">Fixed</option>
                            <option value="Variable">Variable</option>
                            <option value="One-time">One-time</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: theme.text.secondary, marginBottom: 6 }}>
                            Category
                        </label>
                        <input
                            type="text"
                            value={formData.category || ''}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="e.g., Operations, Marketing"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 8,
                                backgroundColor: theme.bg.app,
                                color: theme.text.primary,
                                fontSize: 14,
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: theme.text.secondary, marginBottom: 6 }}>
                            Notes
                        </label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add any additional notes..."
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 8,
                                backgroundColor: theme.bg.app,
                                color: theme.text.primary,
                                fontSize: 14,
                                outline: 'none',
                                resize: 'vertical',
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            border: `1px solid ${theme.border.primary}`,
                            borderRadius: 8,
                            backgroundColor: 'transparent',
                            color: theme.text.primary,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: '#0F766E',
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        {editCost ? 'Save Changes' : 'Add Cost'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ================== MANAGE COLUMNS MODAL ==================

const ManageColumnsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    columns: ColumnConfig[];
    onUpdateColumns: (columns: ColumnConfig[]) => void;
    theme: any;
}> = ({ isOpen, onClose, columns, onUpdateColumns, theme }) => {
    const [localColumns, setLocalColumns] = useState(columns);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnType, setNewColumnType] = useState<ColumnConfig['type']>('text');

    React.useEffect(() => {
        setLocalColumns(columns);
    }, [columns]);

    if (!isOpen) return null;

    const addColumn = () => {
        if (!newColumnName.trim()) return;
        const newCol: ColumnConfig = {
            id: `custom_${Date.now()}`,
            name: newColumnName,
            type: newColumnType,
        };
        setLocalColumns([...localColumns, newCol]);
        setNewColumnName('');
        setNewColumnType('text');
    };

    const deleteColumn = (id: string) => {
        setLocalColumns(localColumns.filter(c => c.id !== id));
    };

    const handleSave = () => {
        onUpdateColumns(localColumns);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    backgroundColor: theme.bg.card,
                    borderRadius: 16,
                    padding: 32,
                    width: '100%',
                    maxWidth: 480,
                    maxHeight: '80vh',
                    overflow: 'auto',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                        Manage Columns
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <X size={20} color={theme.text.secondary} />
                    </button>
                </div>

                {/* Current Columns */}
                <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: theme.text.secondary, marginBottom: 12 }}>Current Columns</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {localColumns.map(col => (
                            <div
                                key={col.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 12px',
                                    backgroundColor: theme.bg.app,
                                    borderRadius: 8,
                                    border: `1px solid ${theme.border.primary}`,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 14, color: theme.text.primary }}>{col.name}</span>
                                    <span style={{ fontSize: 11, padding: '2px 6px', backgroundColor: theme.bg.hover, borderRadius: 4, color: theme.text.muted }}>
                                        {col.type}
                                    </span>
                                    {col.locked && (
                                        <span style={{ fontSize: 10, color: theme.text.muted }}>🔒</span>
                                    )}
                                </div>
                                {!col.locked && (
                                    <button
                                        onClick={() => deleteColumn(col.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                    >
                                        <Trash2 size={14} color="#EF4444" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add New Column */}
                <div style={{ padding: '16px', backgroundColor: theme.bg.app, borderRadius: 12, marginBottom: 24 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: theme.text.secondary, marginBottom: 12 }}>Add New Column</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="text"
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                            placeholder="Column name"
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 6,
                                backgroundColor: theme.bg.card,
                                color: theme.text.primary,
                                fontSize: 13,
                                outline: 'none',
                            }}
                        />
                        <select
                            value={newColumnType}
                            onChange={(e) => setNewColumnType(e.target.value as ColumnConfig['type'])}
                            style={{
                                padding: '8px 12px',
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 6,
                                backgroundColor: theme.bg.card,
                                color: theme.text.primary,
                                fontSize: 13,
                                outline: 'none',
                            }}
                        >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="currency">Currency</option>
                            <option value="badge">Badge</option>
                            <option value="date">Date</option>
                            <option value="dropdown">Dropdown</option>
                        </select>
                        <button
                            onClick={addColumn}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: 6,
                                backgroundColor: '#0F766E',
                                color: 'white',
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            Add
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            border: `1px solid ${theme.border.primary}`,
                            borderRadius: 8,
                            backgroundColor: 'transparent',
                            color: theme.text.primary,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: '#0F766E',
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        Save Changes
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ================== MAIN COSTS PAGE ==================

export const Costs: React.FC = () => {
    const { theme } = useTheme();
    const [costs, setCosts] = useState<CostEntry[]>(sampleCosts);
    const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, _setSortBy] = useState<'addedAt' | 'amount' | 'costName'>('addedAt');
    const [sortOrder, _setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showColumnsModal, setShowColumnsModal] = useState(false);
    const [editingCost, setEditingCost] = useState<CostEntry | null>(null);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(costs.map(c => c.category).filter(Boolean));
        return Array.from(cats);
    }, [costs]);

    // Filter and sort costs
    const filteredCosts = useMemo(() => {
        return costs
            .filter(cost => {
                const matchesSearch = cost.costName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (cost.notes?.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesType = !typeFilter || cost.type === typeFilter;
                const matchesCategory = !categoryFilter || cost.category === categoryFilter;
                return matchesSearch && matchesType && matchesCategory;
            })
            .sort((a, b) => {
                let comparison = 0;
                switch (sortBy) {
                    case 'amount':
                        comparison = a.amount - b.amount;
                        break;
                    case 'costName':
                        comparison = a.costName.localeCompare(b.costName);
                        break;
                    case 'addedAt':
                        comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
                        break;
                }
                return sortOrder === 'asc' ? comparison : -comparison;
            });
    }, [costs, searchTerm, typeFilter, categoryFilter, sortBy, sortOrder]);

    // KPI calculations (based on filtered data for smart totals)
    const totalCosts = filteredCosts.reduce((sum, c) => sum + c.amount, 0);
    const fixedCosts = filteredCosts.filter(c => c.type === 'Fixed').reduce((sum, c) => sum + c.amount, 0);
    const variableCosts = filteredCosts.filter(c => c.type === 'Variable').reduce((sum, c) => sum + c.amount, 0);
    const lastCost = costs.length > 0
        ? costs.reduce((latest, c) => new Date(c.addedAt) > new Date(latest.addedAt) ? c : latest)
        : null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return formatDate(dateStr);
    };

    const handleSaveCost = (cost: CostEntry) => {
        if (editingCost) {
            setCosts(costs.map(c => c.id === cost.id ? cost : c));
        } else {
            setCosts([cost, ...costs]);
        }
        setEditingCost(null);
    };

    const handleDeleteCost = (id: string) => {
        if (confirm('Are you sure you want to delete this cost?')) {
            setCosts(costs.filter(c => c.id !== id));
        }
    };

    const handleEditCost = (cost: CostEntry) => {
        setEditingCost(cost);
        setShowAddModal(true);
    };

    const exportToCSV = () => {
        const headers = ['Cost Name', 'Amount', 'Type', 'Category', 'Added At', 'Notes'];
        const rows = filteredCosts.map(c => [
            c.costName,
            c.amount,
            c.type,
            c.category,
            formatDate(c.addedAt),
            c.notes || '',
        ]);
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `costs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setTypeFilter('');
        setCategoryFilter('');
    };

    const hasActiveFilters = searchTerm || typeFilter || categoryFilter;

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
                            Costs
                        </h1>
                        <p style={{ fontSize: 13, color: theme.text.secondary, margin: '4px 0 0' }}>
                            Track, structure, and control your business expenses
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={() => { setEditingCost(null); setShowAddModal(true); }}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: '#0F766E',
                                color: 'white',
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
                            <Plus size={16} />
                            Add Cost
                        </button>
                        <button
                            onClick={() => setShowColumnsModal(true)}
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
                            <Settings2 size={14} />
                            Manage Columns
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
                    {/* KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
                        <KPICard
                            title="Total Costs (This Period)"
                            value={formatCurrency(totalCosts)}
                            subtext={hasActiveFilters ? 'Filtered results' : 'All expenses'}
                            icon={<DollarSign size={18} color={theme.text.secondary} />}
                            delay={0}
                            theme={theme}
                        />
                        <KPICard
                            title="Fixed Costs"
                            value={formatCurrency(fixedCosts)}
                            subtext="Recurring monthly"
                            icon={<Layers size={18} color={theme.text.secondary} />}
                            delay={1}
                            theme={theme}
                        />
                        <KPICard
                            title="Variable Costs"
                            value={formatCurrency(variableCosts)}
                            subtext="Fluctuating expenses"
                            icon={<TrendingDown size={18} color={theme.text.secondary} />}
                            delay={2}
                            theme={theme}
                        />
                        <KPICard
                            title="Last Added Cost"
                            value={lastCost ? formatCurrency(lastCost.amount) : '—'}
                            subtext={lastCost ? formatRelativeTime(lastCost.addedAt) : 'No costs yet'}
                            icon={<Clock size={18} color={theme.text.secondary} />}
                            delay={3}
                            theme={theme}
                        />
                    </div>

                    {/* Table Card */}
                    <div
                        style={{
                            backgroundColor: theme.bg.card,
                            borderRadius: 12,
                            border: `1px solid ${theme.border.primary}`,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Search & Filter Bar */}
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
                                    placeholder="Search costs..."
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
                                    backgroundColor: showFilters ? theme.bg.hover : 'transparent',
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
                            {typeFilter && (
                                <span style={{ padding: '5px 10px', backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: 16, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Type: {typeFilter}
                                    <X size={10} onClick={() => setTypeFilter('')} style={{ cursor: 'pointer' }} />
                                </span>
                            )}
                            {categoryFilter && (
                                <span style={{ padding: '5px 10px', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: 16, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {categoryFilter}
                                    <X size={10} onClick={() => setCategoryFilter('')} style={{ cursor: 'pointer' }} />
                                </span>
                            )}

                            <div style={{ flex: 1 }} />

                            <span style={{ fontSize: 12, color: theme.text.secondary }}>
                                {filteredCosts.length} cost{filteredCosts.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Filter Dropdowns */}
                        {showFilters && (
                            <div style={{ padding: '12px 20px', backgroundColor: theme.bg.app, borderBottom: `1px solid ${theme.border.primary}`, display: 'flex', gap: 12 }}>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    style={{ padding: '6px 10px', border: `1px solid ${theme.border.primary}`, borderRadius: 4, backgroundColor: theme.bg.card, color: theme.text.primary, fontSize: 12 }}
                                >
                                    <option value="">All Types</option>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Variable">Variable</option>
                                    <option value="One-time">One-time</option>
                                </select>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    style={{ padding: '6px 10px', border: `1px solid ${theme.border.primary}`, borderRadius: 4, backgroundColor: theme.bg.card, color: theme.text.primary, fontSize: 12 }}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {hasActiveFilters && (
                                    <button onClick={clearFilters} style={{ padding: '6px 12px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>
                                        Clear All
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Table */}
                        {filteredCosts.length === 0 ? (
                            <div style={{ padding: 64, textAlign: 'center' }}>
                                <div style={{ width: 64, height: 64, margin: '0 auto 16px', backgroundColor: theme.bg.app, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <DollarSign size={28} color={theme.text.muted} />
                                </div>
                                <p style={{ fontSize: 15, fontWeight: 500, color: theme.text.secondary, margin: '0 0 4px' }}>
                                    {costs.length === 0 ? 'No costs yet' : 'No matching costs'}
                                </p>
                                <p style={{ fontSize: 13, color: theme.text.muted, margin: 0 }}>
                                    {costs.length === 0
                                        ? 'Start by adding your first expense'
                                        : 'Try adjusting your filters'}
                                </p>
                                {costs.length === 0 && (
                                    <button
                                        onClick={() => { setEditingCost(null); setShowAddModal(true); }}
                                        style={{
                                            marginTop: 16,
                                            padding: '10px 20px',
                                            backgroundColor: '#0F766E',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 8,
                                            fontSize: 13,
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        + Add First Cost
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ backgroundColor: theme.bg.app }}>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>
                                                Cost Name
                                            </th>
                                            <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>
                                                Amount
                                            </th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>
                                                Type
                                            </th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>
                                                Category
                                            </th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>
                                                Added At
                                            </th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>
                                                Notes
                                            </th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: theme.text.secondary, borderBottom: `1px solid ${theme.border.primary}` }}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCosts.map((cost) => (
                                            <tr
                                                key={cost.id}
                                                style={{
                                                    transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.bg.hover)}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, color: theme.text.primary, fontWeight: 500 }}>
                                                    {cost.costName}
                                                </td>
                                                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, textAlign: 'right', fontWeight: 600, color: cost.amount > 3000 ? '#EF4444' : theme.text.primary }}>
                                                    {formatCurrency(cost.amount)}
                                                </td>
                                                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, textAlign: 'center' }}>
                                                    <TypeBadge type={cost.type} />
                                                </td>
                                                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, textAlign: 'center' }}>
                                                    {cost.category && <CategoryBadge category={cost.category} theme={theme} />}
                                                </td>
                                                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, color: theme.text.secondary }}>
                                                    {formatDate(cost.addedAt)}
                                                </td>
                                                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, color: theme.text.muted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {cost.notes || '—'}
                                                </td>
                                                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border.primary}`, textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => handleEditCost(cost)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                                            title="Edit"
                                                        >
                                                            <Edit3 size={14} color={theme.text.secondary} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCost(cost.id)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} color="#EF4444" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddCostModal
                isOpen={showAddModal}
                onClose={() => { setShowAddModal(false); setEditingCost(null); }}
                onSave={handleSaveCost}
                columns={columns}
                editCost={editingCost}
                theme={theme}
            />

            <ManageColumnsModal
                isOpen={showColumnsModal}
                onClose={() => setShowColumnsModal(false)}
                columns={columns}
                onUpdateColumns={setColumns}
                theme={theme}
            />
        </DashboardLayout>
    );
};
