import React, { useState, useMemo } from 'react';
import { X, Check, Edit2, Sparkles, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AutoCategorizationPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (transactions: CategorizedTransaction[]) => void;
    transactions: ParsedTransaction[];
}

export interface ParsedTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    originalCategory?: string;
}

export interface CategorizedTransaction extends ParsedTransaction {
    suggestedCategory: string;
    confidence: number;
    isEdited: boolean;
}

interface CategoryConfig {
    id: string;
    label: string;
    labelAr: string;
    icon: string;
    color: string;
    keywords: string[];
}

const CATEGORIES: CategoryConfig[] = [
    { id: 'sales', label: 'Sales', labelAr: 'مبيعات', icon: '💰', color: '#22C55E', keywords: ['sale', 'revenue', 'income', 'payment', 'customer', 'order'] },
    { id: 'cogs', label: 'Cost of Goods', labelAr: 'تكلفة البضائع', icon: '📦', color: '#F59E0B', keywords: ['cost', 'inventory', 'stock', 'purchase', 'supplier', 'wholesale'] },
    { id: 'marketing', label: 'Marketing', labelAr: 'تسويق', icon: '📢', color: '#8B5CF6', keywords: ['ad', 'facebook', 'google', 'marketing', 'campaign', 'promotion'] },
    { id: 'shipping', label: 'Shipping', labelAr: 'شحن', icon: '🚚', color: '#3B82F6', keywords: ['shipping', 'delivery', 'freight', 'courier', 'fedex', 'aramex'] },
    { id: 'salaries', label: 'Salaries', labelAr: 'رواتب', icon: '👥', color: '#EC4899', keywords: ['salary', 'wage', 'payroll', 'employee', 'staff'] },
    { id: 'rent', label: 'Rent', labelAr: 'إيجار', icon: '🏢', color: '#6366F1', keywords: ['rent', 'lease', 'office', 'warehouse', 'storage'] },
    { id: 'utilities', label: 'Utilities', labelAr: 'خدمات', icon: '💡', color: '#14B8A6', keywords: ['electricity', 'water', 'internet', 'phone', 'utility'] },
    { id: 'software', label: 'Software', labelAr: 'برمجيات', icon: '💻', color: '#0EA5E9', keywords: ['software', 'subscription', 'saas', 'app', 'tool', 'license'] },
    { id: 'fees', label: 'Bank Fees', labelAr: 'رسوم بنكية', icon: '🏦', color: '#F97316', keywords: ['fee', 'bank', 'transaction', 'transfer', 'commission'] },
    { id: 'other', label: 'Other', labelAr: 'أخرى', icon: '📋', color: '#64748B', keywords: [] },
];

// Auto-categorization engine
const categorizeTransaction = (transaction: ParsedTransaction): { category: string; confidence: number } => {
    const description = transaction.description.toLowerCase();

    let bestMatch = { category: 'other', confidence: 0.3 };

    for (const cat of CATEGORIES) {
        if (cat.id === 'other') continue;

        for (const keyword of cat.keywords) {
            if (description.includes(keyword)) {
                const confidence = 0.7 + (keyword.length / 20) * 0.25; // Longer keyword = higher confidence
                if (confidence > bestMatch.confidence) {
                    bestMatch = { category: cat.id, confidence: Math.min(confidence, 0.95) };
                }
            }
        }
    }

    // If original category exists, use it with high confidence
    if (transaction.originalCategory) {
        const matchingCat = CATEGORIES.find(c =>
            c.label.toLowerCase() === transaction.originalCategory?.toLowerCase() ||
            c.labelAr === transaction.originalCategory
        );
        if (matchingCat) {
            return { category: matchingCat.id, confidence: 0.98 };
        }
    }

    return bestMatch;
};

export const AutoCategorizationPreview: React.FC<AutoCategorizationPreviewProps> = ({
    isOpen,
    onClose,
    onConfirm,
    transactions,
}) => {
    const { theme, mode } = useTheme();
    const [animateIn, setAnimateIn] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // Categorize all transactions
    const [categorizedTransactions, setCategorizedTransactions] = useState<CategorizedTransaction[]>([]);

    // Initialize categorization
    React.useEffect(() => {
        if (isOpen && transactions.length > 0) {
            const categorized = transactions.map(t => {
                const result = categorizeTransaction(t);
                return {
                    ...t,
                    suggestedCategory: result.category,
                    confidence: result.confidence,
                    isEdited: false,
                };
            });
            setCategorizedTransactions(categorized);
            setTimeout(() => setAnimateIn(true), 50);
        } else {
            setAnimateIn(false);
        }
    }, [isOpen, transactions]);

    // Stats
    const stats = useMemo(() => {
        const highConfidence = categorizedTransactions.filter(t => t.confidence >= 0.8).length;
        const lowConfidence = categorizedTransactions.filter(t => t.confidence < 0.6).length;
        const edited = categorizedTransactions.filter(t => t.isEdited).length;

        return { total: categorizedTransactions.length, highConfidence, lowConfidence, edited };
    }, [categorizedTransactions]);

    // Update category for a transaction
    const updateCategory = (id: string, categoryId: string) => {
        setCategorizedTransactions(prev => prev.map(t =>
            t.id === id ? { ...t, suggestedCategory: categoryId, confidence: 1, isEdited: true } : t
        ));
        setEditingId(null);
    };

    // Handle confirm
    const handleConfirm = async () => {
        setProcessing(true);
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        onConfirm(categorizedTransactions);
        setProcessing(false);
        handleClose();
    };

    // Handle close
    const handleClose = () => {
        setAnimateIn(false);
        setTimeout(onClose, 200);
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: animateIn ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0)',
                backdropFilter: animateIn ? 'blur(8px)' : 'blur(0px)',
                transition: 'all 0.3s ease',
                padding: '20px',
            }}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div
                style={{
                    backgroundColor: theme.bg.card,
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '700px',
                    maxHeight: '85vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: mode === 'Dark'
                        ? '0 32px 64px rgba(0, 0, 0, 0.6)'
                        : '0 32px 64px rgba(0, 0, 0, 0.2)',
                    transform: animateIn ? 'scale(1)' : 'scale(0.95)',
                    opacity: animateIn ? 1 : 0,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        padding: '28px 32px 20px',
                        borderBottom: `1px solid ${theme.border.primary}`,
                    }}
                >
                    <div>
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: 700,
                            color: theme.text.primary,
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                            <Sparkles size={22} color={theme.accent.primary} />
                            Smart Categorization
                        </h2>
                        <p style={{ fontSize: '14px', color: theme.text.secondary, margin: '6px 0 0' }}>
                            Review AI-suggested categories for your transactions
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <X size={20} color={theme.text.secondary} />
                    </button>
                </div>

                {/* Stats Bar */}
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px 32px',
                    backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                    borderBottom: `1px solid ${theme.border.subtle}`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                        <span style={{ fontSize: '13px', color: theme.text.secondary }}>
                            <strong>{stats.highConfidence}</strong> high confidence
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                        <span style={{ fontSize: '13px', color: theme.text.secondary }}>
                            <strong>{stats.lowConfidence}</strong> needs review
                        </span>
                    </div>
                    {stats.edited > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.accent.primary }} />
                            <span style={{ fontSize: '13px', color: theme.text.secondary }}>
                                <strong>{stats.edited}</strong> manually edited
                            </span>
                        </div>
                    )}
                </div>

                {/* Transactions List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px' }}>
                    {categorizedTransactions.map((transaction, index) => {
                        const category = CATEGORIES.find(c => c.id === transaction.suggestedCategory)!;
                        const isLowConfidence = transaction.confidence < 0.6;
                        const isEditing = editingId === transaction.id;

                        return (
                            <div
                                key={transaction.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px',
                                    backgroundColor: isLowConfidence
                                        ? mode === 'Dark' ? 'rgba(245, 158, 11, 0.08)' : '#FFFBEB'
                                        : 'transparent',
                                    borderRadius: '12px',
                                    marginBottom: '8px',
                                    border: `1px solid ${isLowConfidence ? '#F59E0B30' : 'transparent'}`,
                                    animation: 'fadeSlideIn 0.3s ease-out',
                                    animationDelay: `${index * 30}ms`,
                                }}
                            >
                                {/* Transaction Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '13px', color: theme.text.muted }}>
                                            {transaction.date}
                                        </span>
                                        {isLowConfidence && (
                                            <AlertTriangle size={14} color="#F59E0B" />
                                        )}
                                    </div>
                                    <p style={{
                                        fontSize: '15px',
                                        fontWeight: 500,
                                        color: theme.text.primary,
                                        margin: 0,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        {transaction.description}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div style={{
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    color: transaction.amount >= 0 ? theme.status.profit : theme.status.cost,
                                    whiteSpace: 'nowrap',
                                }}>
                                    {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'EGP',
                                    })}
                                </div>

                                {/* Category */}
                                {isEditing ? (
                                    <div style={{
                                        position: 'absolute',
                                        right: '32px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        backgroundColor: theme.bg.card,
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                        padding: '8px',
                                        zIndex: 10,
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '4px',
                                        minWidth: '280px',
                                    }}>
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => updateCategory(transaction.id, cat.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '10px 12px',
                                                    backgroundColor: cat.id === transaction.suggestedCategory
                                                        ? `${cat.color}15`
                                                        : 'transparent',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <span>{cat.icon}</span>
                                                <span style={{ fontSize: '13px', color: theme.text.primary }}>
                                                    {cat.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setEditingId(transaction.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 14px',
                                            backgroundColor: `${category.color}15`,
                                            border: `1px solid ${category.color}30`,
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>{category.icon}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: category.color }}>
                                            {category.label}
                                        </span>
                                        <Edit2 size={12} color={theme.text.muted} />
                                    </button>
                                )}

                                {/* Confidence */}
                                <div style={{
                                    width: '40px',
                                    textAlign: 'right',
                                }}>
                                    {transaction.isEdited ? (
                                        <Check size={18} color={theme.accent.primary} />
                                    ) : (
                                        <span style={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: transaction.confidence >= 0.8 ? '#22C55E' :
                                                transaction.confidence >= 0.6 ? '#F59E0B' : theme.status.cost,
                                        }}>
                                            {Math.round(transaction.confidence * 100)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 32px 24px',
                        borderTop: `1px solid ${theme.border.primary}`,
                    }}
                >
                    <button
                        onClick={handleClose}
                        style={{
                            padding: '14px 24px',
                            backgroundColor: 'transparent',
                            border: `1px solid ${theme.border.primary}`,
                            borderRadius: '12px',
                            color: theme.text.secondary,
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={processing}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '14px 28px',
                            backgroundColor: theme.status.profit,
                            border: 'none',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: processing ? 'not-allowed' : 'pointer',
                            opacity: processing ? 0.7 : 1,
                        }}
                    >
                        {processing ? (
                            <>
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                Processing...
                            </>
                        ) : (
                            <>
                                Confirm & Import
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Click outside to close category picker */}
            {editingId && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 5 }}
                    onClick={() => setEditingId(null)}
                />
            )}

            {/* CSS Keyframes */}
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
