import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { createPurchase } from '../../services/vendorService';
import type { CreatePurchaseInput } from '../../types/accountsPayable';

interface AddInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    vendorName: string;
    onSuccess: () => void;
}

export const AddInvoiceModal: React.FC<AddInvoiceModalProps> = ({
    isOpen,
    onClose,
    vendorId,
    vendorName,
    onSuccess,
}) => {
    const { theme, mode } = useTheme();
    const [activeMode, setActiveMode] = useState<'manual' | 'upload'>('manual');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

    // Form state
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');

    const [taxAmount, setTaxAmount] = useState('');
    const [discountAmount, setDiscountAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<any[]>([
        { product_name: '', description: '', quantity: 1, unit_cost: 0 }
    ]);

    // Calculate totals
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    const parsedTax = parseFloat(taxAmount) || 0;
    const parsedDiscount = parseFloat(discountAmount) || 0;
    const total = calculatedSubtotal + parsedTax - parsedDiscount;

    const handleAddItem = () => {
        setItems([...items, { product_name: '', description: '', quantity: 1, unit_cost: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleInvoiceNumberChange = (value: string) => {
        setInvoiceNumber(value);
        // Simulate duplicate detection
        if (value === 'INV-2024-001' || value === 'INV-2024-002') {
            setShowDuplicateWarning(true);
        } else {
            setShowDuplicateWarning(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const input: CreatePurchaseInput = {
                vendor_id: vendorId,
                vendor_name: vendorName,
                product_name: items.length > 0 ? items[0].product_name : `Invoice ${invoiceNumber}`,
                purchase_price: total,
                quantity: 1,
                paid_amount: 0,
                notes: `Invoice: ${invoiceNumber}, Date: ${invoiceDate}, Due: ${dueDate}. ${notes || ''}`,
                currency: 'EGP',
            };

            await createPurchase(input);
            onSuccess();
            resetForm();
        } catch (error) {
            console.error('Error creating invoice:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setInvoiceNumber('');
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        setDueDate('');
        setTaxAmount('');
        setDiscountAmount('');
        setNotes('');
        setItems([{ product_name: '', description: '', quantity: 1, unit_cost: 0 }]);
        setShowDuplicateWarning(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Simulate AI parsing
            setIsSubmitting(true);
            setTimeout(() => {
                setInvoiceNumber(`INV-${Date.now()}`);
                setTaxAmount('700');
                setItems([
                    { product_name: 'Product from Invoice', description: 'Parsed automatically', quantity: 10, unit_cost: 500 }
                ]);
                setIsSubmitting(false);
                setActiveMode('manual');
            }, 2000);
        }
    };

    if (!isOpen) return null;

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '10px',
        border: `1px solid ${theme.border.primary}`,
        backgroundColor: theme.bg.app,
        color: theme.text.primary,
        fontSize: '14px',
        outline: 'none',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '13px',
        fontWeight: 500,
        color: theme.text.secondary,
        marginBottom: '6px',
    };

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                        backgroundColor: theme.bg.card,
                        width: '700px',
                        maxWidth: '95vw',
                        maxHeight: '90vh',
                        borderRadius: '20px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: `1px solid ${theme.border.primary}`,
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: `1px solid ${theme.border.primary}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>
                                Add Invoice
                            </h2>
                            <p style={{ fontSize: '13px', color: theme.text.muted, margin: '4px 0 0' }}>
                                For {vendorName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '8px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: theme.bg.hover,
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} color={theme.text.secondary} />
                        </button>
                    </div>

                    {/* Mode Toggle */}
                    <div style={{
                        padding: '16px 24px',
                        borderBottom: `1px solid ${theme.border.primary}`,
                        display: 'flex',
                        gap: '12px',
                    }}>
                        <button
                            onClick={() => setActiveMode('manual')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '10px',
                                border: activeMode === 'manual'
                                    ? `2px solid ${theme.accent.primary}`
                                    : `1px solid ${theme.border.primary}`,
                                backgroundColor: activeMode === 'manual'
                                    ? (mode === 'Dark' ? 'rgba(15, 118, 110, 0.1)' : '#E6FAF8')
                                    : 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                color: activeMode === 'manual' ? theme.accent.primary : theme.text.secondary,
                                fontWeight: 600,
                                fontSize: '14px',
                            }}
                        >
                            <FileText size={18} />
                            Manual Entry
                        </button>
                        <button
                            onClick={() => setActiveMode('upload')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '10px',
                                border: activeMode === 'upload'
                                    ? `2px solid ${theme.accent.primary}`
                                    : `1px solid ${theme.border.primary}`,
                                backgroundColor: activeMode === 'upload'
                                    ? (mode === 'Dark' ? 'rgba(15, 118, 110, 0.1)' : '#E6FAF8')
                                    : 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                color: activeMode === 'upload' ? theme.accent.primary : theme.text.secondary,
                                fontWeight: 600,
                                fontSize: '14px',
                            }}
                        >
                            <Upload size={18} />
                            Upload & Parse
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                        {activeMode === 'upload' ? (
                            <div style={{
                                padding: '40px',
                                border: `2px dashed ${theme.border.primary}`,
                                borderRadius: '16px',
                                textAlign: 'center',
                                backgroundColor: theme.bg.hover,
                            }}>
                                {isSubmitting ? (
                                    <div>
                                        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 16px', color: theme.accent.primary }} />
                                        <p style={{ color: theme.text.primary, fontWeight: 600 }}>Parsing invoice...</p>
                                        <p style={{ color: theme.text.muted, fontSize: '14px' }}>Extracting data using AI</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={40} style={{ margin: '0 auto 16px', color: theme.accent.primary }} />
                                        <p style={{ color: theme.text.primary, fontWeight: 600, marginBottom: '8px' }}>
                                            Drop your invoice file here
                                        </p>
                                        <p style={{ color: theme.text.muted, fontSize: '14px', marginBottom: '16px' }}>
                                            PDF, JPG, PNG, or Excel. We'll extract data automatically.
                                        </p>
                                        <label style={{
                                            display: 'inline-block',
                                            padding: '10px 20px',
                                            backgroundColor: theme.accent.primary,
                                            color: '#FFF',
                                            borderRadius: '10px',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                        }}>
                                            Choose File
                                            <input
                                                type="file"
                                                onChange={handleFileUpload}
                                                accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    </>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {/* Duplicate Warning */}
                                {showDuplicateWarning && (
                                    <div style={{
                                        padding: '12px 16px',
                                        backgroundColor: mode === 'Dark' ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                                        borderRadius: '10px',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}>
                                        <AlertTriangle size={20} color="#F59E0B" />
                                        <p style={{ color: '#B45309', fontSize: '14px', margin: 0 }}>
                                            <strong>Duplicate detected:</strong> An invoice with this number may already exist.
                                        </p>
                                    </div>
                                )}

                                {/* Invoice Details */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={labelStyle}>Invoice Number *</label>
                                        <input
                                            type="text"
                                            value={invoiceNumber}
                                            onChange={(e) => handleInvoiceNumberChange(e.target.value)}
                                            placeholder="INV-2024-XXX"
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Invoice Date *</label>
                                        <input
                                            type="date"
                                            value={invoiceDate}
                                            onChange={(e) => setInvoiceDate(e.target.value)}
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Due Date</label>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <label style={{ ...labelStyle, marginBottom: 0 }}>Line Items</label>
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                border: `1px solid ${theme.border.primary}`,
                                                backgroundColor: 'transparent',
                                                color: theme.text.secondary,
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                            }}
                                        >
                                            <Plus size={14} />
                                            Add Item
                                        </button>
                                    </div>

                                    <div style={{
                                        border: `1px solid ${theme.border.primary}`,
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                    }}>
                                        {items.map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                                                    gap: '12px',
                                                    padding: '12px',
                                                    borderBottom: index < items.length - 1 ? `1px solid ${theme.border.primary}` : 'none',
                                                    backgroundColor: theme.bg.app,
                                                }}
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Product name"
                                                    value={item.product_name}
                                                    onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                                                    style={{ ...inputStyle, padding: '10px 12px' }}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Qty"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    style={{ ...inputStyle, padding: '10px 12px' }}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Unit cost"
                                                    value={item.unit_cost || ''}
                                                    onChange={(e) => handleItemChange(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                                                    style={{ ...inputStyle, padding: '10px 12px' }}
                                                />
                                                <div style={{
                                                    padding: '10px 12px',
                                                    backgroundColor: theme.bg.hover,
                                                    borderRadius: '10px',
                                                    fontWeight: 600,
                                                    color: theme.text.primary,
                                                    fontSize: '14px',
                                                }}>
                                                    {(item.quantity * item.unit_cost).toLocaleString()}
                                                </div>
                                                {items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(index)}
                                                        style={{
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            backgroundColor: 'transparent',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <X size={16} color={theme.text.muted} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={labelStyle}>Tax Amount</label>
                                        <input
                                            type="number"
                                            value={taxAmount}
                                            onChange={(e) => setTaxAmount(e.target.value)}
                                            placeholder="0"
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Discount</label>
                                        <input
                                            type="number"
                                            value={discountAmount}
                                            onChange={(e) => setDiscountAmount(e.target.value)}
                                            placeholder="0"
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Total Amount</label>
                                        <div style={{
                                            ...inputStyle,
                                            backgroundColor: mode === 'Dark' ? 'rgba(15, 118, 110, 0.1)' : '#E6FAF8',
                                            fontWeight: 700,
                                            color: theme.accent.primary,
                                            border: `1px solid ${theme.accent.primary}`,
                                        }}>
                                            EGP {total.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={labelStyle}>Notes</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Additional notes..."
                                        rows={3}
                                        style={{
                                            ...inputStyle,
                                            resize: 'vertical',
                                        }}
                                    />
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: '10px',
                                            border: `1px solid ${theme.border.primary}`,
                                            backgroundColor: 'transparent',
                                            color: theme.text.secondary,
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !invoiceNumber}
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            backgroundColor: theme.accent.primary,
                                            color: '#FFF',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            opacity: isSubmitting || !invoiceNumber ? 0.6 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                        Save Invoice
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
