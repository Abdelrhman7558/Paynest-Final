import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, AlertCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ColumnMappingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (mappings: ColumnMapping[]) => void;
    columns: string[];
    fileName: string;
    previewData?: Record<string, string>[];
}

export interface ColumnMapping {
    sourceColumn: string;
    targetField: TargetField | null;
    confidence: number;
    sampleData: string[];
}

type TargetField =
    | 'date'
    | 'description'
    | 'amount'
    | 'category'
    | 'type'
    | 'account'
    | 'reference'
    | 'notes'
    | 'skip';

interface FieldConfig {
    id: TargetField;
    label: string;
    required: boolean;
    icon: string;
    keywords: string[];
}

const TARGET_FIELDS: FieldConfig[] = [
    { id: 'date', label: 'Date', required: true, icon: '📅', keywords: ['date', 'time', 'when', 'تاريخ'] },
    { id: 'description', label: 'Description', required: true, icon: '📝', keywords: ['description', 'desc', 'name', 'item', 'product', 'الوصف', 'البيان'] },
    { id: 'amount', label: 'Amount', required: true, icon: '💰', keywords: ['amount', 'total', 'price', 'value', 'sum', 'المبلغ', 'القيمة'] },
    { id: 'category', label: 'Category', required: false, icon: '🏷️', keywords: ['category', 'type', 'group', 'التصنيف'] },
    { id: 'type', label: 'Type (Income/Expense)', required: false, icon: '↕️', keywords: ['type', 'direction', 'flow', 'النوع'] },
    { id: 'account', label: 'Account', required: false, icon: '🏦', keywords: ['account', 'bank', 'wallet', 'الحساب'] },
    { id: 'reference', label: 'Reference', required: false, icon: '#️⃣', keywords: ['reference', 'ref', 'id', 'number', 'الرقم المرجعي'] },
    { id: 'notes', label: 'Notes', required: false, icon: '📋', keywords: ['notes', 'memo', 'comment', 'ملاحظات'] },
    { id: 'skip', label: 'Skip Column', required: false, icon: '⏭️', keywords: [] },
];

// Smart column detection
const detectColumnMapping = (columnName: string, sampleData: string[]): { field: TargetField | null; confidence: number } => {
    const normalizedName = columnName.toLowerCase().trim();

    // Check each target field
    for (const field of TARGET_FIELDS) {
        if (field.id === 'skip') continue;

        for (const keyword of field.keywords) {
            if (normalizedName.includes(keyword)) {
                return { field: field.id, confidence: 0.9 };
            }
        }
    }

    // Check sample data patterns
    if (sampleData.length > 0) {
        const sample = sampleData[0];

        // Date pattern
        if (/^\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}/.test(sample)) {
            return { field: 'date', confidence: 0.85 };
        }

        // Amount pattern (numbers with optional currency symbols)
        if (/^[\$€£¥₹]?\s*-?\d+([,.\s]\d+)*\s*[\$€£¥₹]?$/.test(sample.trim())) {
            return { field: 'amount', confidence: 0.8 };
        }
    }

    return { field: null, confidence: 0 };
};

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    columns,
    fileName,
    previewData = [],
}) => {
    const { theme, mode } = useTheme();
    const [mappings, setMappings] = useState<ColumnMapping[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animateIn, setAnimateIn] = useState(false);

    // Initialize mappings with smart detection
    useEffect(() => {
        if (isOpen && columns.length > 0) {
            const initialMappings: ColumnMapping[] = columns.map(col => {
                const sampleData = previewData.slice(0, 3).map(row => row[col] || '');
                const detection = detectColumnMapping(col, sampleData);

                return {
                    sourceColumn: col,
                    targetField: detection.field,
                    confidence: detection.confidence,
                    sampleData,
                };
            });
            setMappings(initialMappings);
            setCurrentIndex(0);
            setTimeout(() => setAnimateIn(true), 50);
        } else {
            setAnimateIn(false);
        }
    }, [isOpen, columns, previewData]);

    // Calculate completion status
    const completionStatus = useMemo(() => {
        const requiredFields = TARGET_FIELDS.filter(f => f.required).map(f => f.id);
        const mappedFields = mappings.filter(m => m.targetField && m.targetField !== 'skip').map(m => m.targetField);
        const missingRequired = requiredFields.filter(f => !mappedFields.includes(f));

        return {
            total: columns.length,
            mapped: mappings.filter(m => m.targetField !== null).length,
            missingRequired,
            isComplete: missingRequired.length === 0,
        };
    }, [mappings, columns.length]);

    // Update mapping for a column
    const updateMapping = (index: number, targetField: TargetField | null) => {
        setMappings(prev => prev.map((m, i) =>
            i === index ? { ...m, targetField, confidence: 1 } : m
        ));
    };

    // Handle confirm
    const handleConfirm = () => {
        if (completionStatus.isComplete) {
            onConfirm(mappings);
            handleClose();
        }
    };

    // Handle close
    const handleClose = () => {
        setAnimateIn(false);
        setTimeout(onClose, 200);
    };

    if (!isOpen) return null;

    const currentMapping = mappings[currentIndex];

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
                    maxWidth: '600px',
                    maxHeight: '90vh',
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
                        padding: '28px 32px 24px',
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
                            Map your columns
                        </h2>
                        <p style={{ fontSize: '14px', color: theme.text.secondary, margin: '6px 0 0' }}>
                            {fileName} • {completionStatus.mapped}/{completionStatus.total} columns mapped
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

                {/* Progress Bar */}
                <div style={{ padding: '0 32px', marginTop: '20px' }}>
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                    }}>
                        {columns.map((_, i) => (
                            <div
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                style={{
                                    flex: 1,
                                    height: '4px',
                                    backgroundColor: mappings[i]?.targetField
                                        ? theme.accent.primary
                                        : (i === currentIndex ? theme.text.muted : theme.border.primary),
                                    borderRadius: '2px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '28px 32px', flex: 1, overflowY: 'auto' }}>
                    {currentMapping && (
                        <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
                            {/* Current Column */}
                            <div style={{
                                padding: '20px',
                                backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                borderRadius: '16px',
                                marginBottom: '24px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: theme.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Column {currentIndex + 1} of {columns.length}
                                    </span>
                                    {currentMapping.confidence > 0 && (
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: theme.accent.primary,
                                            backgroundColor: `${theme.accent.primary}15`,
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                        }}>
                                            {Math.round(currentMapping.confidence * 100)}% match
                                        </span>
                                    )}
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: theme.text.primary, margin: '0 0 8px' }}>
                                    "{currentMapping.sourceColumn}"
                                </h3>
                                {currentMapping.sampleData.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {currentMapping.sampleData.slice(0, 3).map((sample, i) => (
                                            <span key={i} style={{
                                                fontSize: '13px',
                                                color: theme.text.secondary,
                                                backgroundColor: theme.bg.hover,
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                            }}>
                                                {sample || '(empty)'}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Target Field Selection */}
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {TARGET_FIELDS.map(field => {
                                    const isSelected = currentMapping.targetField === field.id;
                                    const isUsed = mappings.some((m, i) => i !== currentIndex && m.targetField === field.id);

                                    return (
                                        <button
                                            key={field.id}
                                            onClick={() => !isUsed && updateMapping(currentIndex, field.id)}
                                            disabled={isUsed && field.id !== 'skip'}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '14px',
                                                padding: '16px 20px',
                                                backgroundColor: isSelected
                                                    ? `${theme.accent.primary}10`
                                                    : 'transparent',
                                                border: `2px solid ${isSelected ? theme.accent.primary : theme.border.primary}`,
                                                borderRadius: '14px',
                                                cursor: isUsed && field.id !== 'skip' ? 'not-allowed' : 'pointer',
                                                opacity: isUsed && field.id !== 'skip' ? 0.5 : 1,
                                                transition: 'all 0.2s ease',
                                                textAlign: 'left',
                                            }}
                                        >
                                            <span style={{ fontSize: '20px' }}>{field.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '15px', fontWeight: 600, color: theme.text.primary }}>
                                                        {field.label}
                                                    </span>
                                                    {field.required && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontWeight: 600,
                                                            color: theme.status.cost,
                                                            backgroundColor: `${theme.status.cost}15`,
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                        }}>
                                                            Required
                                                        </span>
                                                    )}
                                                    {isUsed && field.id !== 'skip' && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontWeight: 600,
                                                            color: theme.text.muted,
                                                        }}>
                                                            Already mapped
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && <Check size={20} color={theme.accent.primary} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
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
                        onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '14px 24px',
                            backgroundColor: 'transparent',
                            border: `1px solid ${theme.border.primary}`,
                            borderRadius: '12px',
                            color: currentIndex === 0 ? theme.text.muted : theme.text.secondary,
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                            opacity: currentIndex === 0 ? 0.5 : 1,
                        }}
                    >
                        <ArrowLeft size={18} />
                        Previous
                    </button>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        {currentIndex < columns.length - 1 ? (
                            <button
                                onClick={() => setCurrentIndex(currentIndex + 1)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '14px 28px',
                                    backgroundColor: theme.accent.primary,
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#FFFFFF',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Next
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleConfirm}
                                disabled={!completionStatus.isComplete}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '14px 28px',
                                    backgroundColor: completionStatus.isComplete ? theme.status.profit : theme.text.muted,
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#FFFFFF',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: completionStatus.isComplete ? 'pointer' : 'not-allowed',
                                }}
                            >
                                <Check size={18} />
                                Confirm Mapping
                            </button>
                        )}
                    </div>
                </div>

                {/* Missing Required Fields Warning */}
                {completionStatus.missingRequired.length > 0 && currentIndex === columns.length - 1 && (
                    <div style={{
                        margin: '0 32px 24px',
                        padding: '14px 18px',
                        backgroundColor: mode === 'Dark' ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        <AlertCircle size={20} color={theme.status.cost} />
                        <span style={{ fontSize: '14px', color: theme.status.cost }}>
                            Missing required fields: {completionStatus.missingRequired.map(f =>
                                TARGET_FIELDS.find(t => t.id === f)?.label
                            ).join(', ')}
                        </span>
                    </div>
                )}
            </div>

            {/* CSS Keyframes */}
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
