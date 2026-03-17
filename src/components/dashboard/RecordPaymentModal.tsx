import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Calendar, CreditCard, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { recordPayment, formatCurrencyValue } from '../../services/vendorService';
import type { RecordPaymentInput, PaymentMethod, PurchaseRecord } from '../../types/accountsPayable';

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    vendorName: string;
    invoices: PurchaseRecord[];
    onSuccess: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
    isOpen,
    onClose,
    vendorId,
    vendorName,
    invoices,
    onSuccess,
}) => {
    const { theme, mode } = useTheme();
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [selectedPurchaseId, setSelectedPurchaseId] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMethodDropdown, setShowMethodDropdown] = useState(false);

    if (!isOpen) return null;

    const paymentMethods: { value: PaymentMethod; label: string }[] = [
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'cash', label: 'Cash' },
        { value: 'check', label: 'Check' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'other', label: 'Other' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;

        setIsSubmitting(true);
        try {
            const input: RecordPaymentInput = {
                vendor_id: vendorId,
                purchase_id: selectedPurchaseId || undefined,
                payment_date: paymentDate,
                amount: parseFloat(amount),
                payment_method: paymentMethod,
                reference_number: referenceNumber || undefined,
                notes: notes || undefined,
            };

            await recordPayment(input);
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error recording payment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setAmount('');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('bank_transfer');
        setReferenceNumber('');
        setSelectedPurchaseId('');
        setNotes('');
        onClose();
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        borderRadius: '12px',
        border: `1px solid ${theme.border.primary}`,
        backgroundColor: theme.bg.app,
        color: theme.text.primary,
        fontSize: '14px',
        outline: 'none',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        color: theme.text.secondary,
        marginBottom: '8px',
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                    backgroundColor: theme.bg.card,
                    borderRadius: '24px',
                    width: '500px',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: `1px solid ${theme.border.primary}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: mode === 'Dark' ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <DollarSign size={22} color="#22C55E" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>
                                Record Payment
                            </h2>
                            <p style={{ fontSize: '13px', color: theme.text.muted, margin: '4px 0 0' }}>
                                {vendorName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{
                            padding: '8px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: theme.bg.hover,
                            cursor: 'pointer',
                        }}
                    >
                        <X size={20} color={theme.text.secondary} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Link to Purchase (Optional) */}
                    {invoices.length > 0 && (
                        <div>
                            <label style={labelStyle}>Link to Purchase (Optional)</label>
                            <select
                                value={selectedPurchaseId}
                                onChange={(e) => setSelectedPurchaseId(e.target.value)}
                                style={inputStyle}
                            >
                                <option value="">No specific purchase</option>
                                {invoices.map((purchase) => (
                                    <option key={purchase.id} value={purchase.id}>
                                        {purchase.product_name} - {formatCurrencyValue(purchase.outstanding_amount)} outstanding
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <label style={labelStyle}>Amount *</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: theme.text.muted,
                                fontSize: '14px',
                                fontWeight: 600,
                            }}>
                                EGP
                            </span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                style={{
                                    ...inputStyle,
                                    paddingLeft: '54px',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                }}
                            />
                        </div>
                    </div>

                    {/* Payment Date & Method Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Payment Date *</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} color={theme.text.muted} style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                }} />
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                    style={{ ...inputStyle, paddingLeft: '44px' }}
                                />
                            </div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <label style={labelStyle}>Payment Method *</label>
                            <button
                                type="button"
                                onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                                style={{
                                    ...inputStyle,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <CreditCard size={18} color={theme.text.muted} />
                                    {paymentMethods.find(m => m.value === paymentMethod)?.label}
                                </div>
                                <ChevronDown size={16} color={theme.text.muted} />
                            </button>

                            {showMethodDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    marginTop: '4px',
                                    backgroundColor: theme.bg.card,
                                    borderRadius: '12px',
                                    border: `1px solid ${theme.border.primary}`,
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                    zIndex: 100,
                                    overflow: 'hidden',
                                }}>
                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.value}
                                            type="button"
                                            onClick={() => {
                                                setPaymentMethod(method.value);
                                                setShowMethodDropdown(false);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: 'none',
                                                backgroundColor: paymentMethod === method.value ? theme.bg.hover : 'transparent',
                                                color: theme.text.primary,
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            {method.label}
                                            {paymentMethod === method.value && (
                                                <Check size={16} color={theme.accent.primary} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reference Number */}
                    <div>
                        <label style={labelStyle}>Reference Number</label>
                        <input
                            type="text"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            placeholder="Transaction ID, check number, etc."
                            style={inputStyle}
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label style={labelStyle}>Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes..."
                            rows={3}
                            style={{
                                ...inputStyle,
                                resize: 'vertical',
                                minHeight: '80px',
                            }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button
                            type="button"
                            onClick={handleClose}
                            style={{
                                flex: 1,
                                padding: '14px 24px',
                                borderRadius: '12px',
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
                            disabled={isSubmitting || !amount}
                            style={{
                                flex: 1,
                                padding: '14px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: '#22C55E',
                                color: '#FFF',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: isSubmitting || !amount ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting || !amount ? 0.6 : 1,
                            }}
                        >
                            {isSubmitting ? 'Recording...' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
