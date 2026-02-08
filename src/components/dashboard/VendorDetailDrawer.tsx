import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Upload,
    FileText,
    Plus,
    DollarSign,
    Clock,
    Download,
    CreditCard,
    Package,
    Mail,
    Phone,
    MapPin,
    Building2,
    Truck,
    Image,
    Edit3,
    Check,
    Loader2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { RecordPaymentModal } from './RecordPaymentModal';
import {
    fetchVendorDetail,
    createProduct,
    formatCurrencyValue,
    getStatusColor,
} from '../../services/vendorService';
import type {
    PurchaseRecord,
    VendorDetail,
    CreateProductInput,
} from '../../types/accountsPayable';

interface VendorDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    purchase?: PurchaseRecord | null;
    vendor?: { id: string; name: string; contact_person?: string } | null;
    onRefresh: () => void;
}

type TabType = 'overview' | 'products' | 'payments' | 'shipments' | 'attachments' | 'profile';

export const VendorDetailDrawer: React.FC<VendorDetailDrawerProps> = ({
    isOpen,
    onClose,
    purchase,
    vendor,
    onRefresh,
}) => {
    const effectiveVendorId = purchase?.vendor_id || vendor?.id;
    const effectiveVendorName = purchase?.vendor_name || vendor?.name;

    const { theme, mode } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [vendorDetail, setVendorDetail] = useState<VendorDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showRecordPayment, setShowRecordPayment] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New product form
    const [newProduct, setNewProduct] = useState<Partial<CreateProductInput>>({});

    useEffect(() => {
        if ((purchase || vendor) && isOpen) {
            loadVendorData();
        }
    }, [purchase, vendor, isOpen]);

    const loadVendorData = async () => {
        if (!effectiveVendorId) return;
        setIsLoading(true);
        try {
            const data = await fetchVendorDetail(effectiveVendorId);
            setVendorDetail(data);
        } catch (error) {
            console.error('Error loading vendor data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentRecorded = () => {
        setShowRecordPayment(false);
        loadVendorData();
        onRefresh();
    };

    const handleAddProduct = async () => {
        if (!effectiveVendorId || !newProduct.name || !newProduct.unit_price) return;

        try {
            await createProduct({
                vendor_id: effectiveVendorId!,
                name: newProduct.name,
                description: newProduct.description,
                unit_price: newProduct.unit_price,
                category: newProduct.category,
            });
            await loadVendorData();
            setShowAddProduct(false);
            setNewProduct({});
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // Simulate file upload
            console.log('Uploading files:', files);
            // In real implementation, upload to storage and save attachment record
        }
    };

    const handleInlineEdit = (field: string, currentValue: string) => {
        setEditingField(field);
        setEditValue(currentValue);
    };

    const handleSaveEdit = async () => {
        // In real implementation, save to backend
        setEditingField(null);
        setEditValue('');
    };

    if (!isOpen || !effectiveVendorId) return null;

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const tabs: { key: TabType; label: string; count?: number }[] = [
        { key: 'overview', label: 'Overview' },
        { key: 'products', label: 'Products', count: vendorDetail?.products.length },
        { key: 'payments', label: 'Payments', count: vendorDetail?.payments.length },
        { key: 'shipments', label: 'Shipments', count: vendorDetail?.shipments.length },
        { key: 'attachments', label: 'Attachments', count: vendorDetail?.attachments.length },
        { key: 'profile', label: 'Profile' },
    ];

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
            }}>
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{
                        backgroundColor: theme.bg.app,
                        width: '900px',
                        maxWidth: '95vw',
                        height: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '-10px 0 50px rgba(0,0,0,0.3)',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '24px 32px',
                        borderBottom: `1px solid ${theme.border.primary}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: theme.bg.card,
                    }}>
                        <div className="flex items-center gap-4">
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                backgroundColor: mode === 'Dark' ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#3B82F6',
                                fontSize: '24px',
                                fontWeight: 700,
                            }}>
                                {effectiveVendorName?.charAt(0) || 'V'}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>
                                    {effectiveVendorName || 'Unknown Vendor'}
                                </h2>
                                <p style={{ fontSize: '14px', color: theme.text.muted, margin: '4px 0 0' }}>
                                    {purchase ? `${purchase.product_name} • ${formatCurrencyValue(purchase.total_cost)}` : 'Vendor Details'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px',
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: theme.bg.hover,
                                cursor: 'pointer',
                            }}
                        >
                            <X size={24} color={theme.text.secondary} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div style={{
                        padding: '0 32px',
                        borderBottom: `1px solid ${theme.border.primary}`,
                        display: 'flex',
                        gap: '24px',
                        backgroundColor: theme.bg.card,
                        overflowX: 'auto',
                    }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    padding: '16px 0',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: activeTab === tab.key ? theme.accent.primary : theme.text.muted,
                                    borderBottom: activeTab === tab.key
                                        ? `2px solid ${theme.accent.primary}`
                                        : '2px solid transparent',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span style={{
                                        padding: '2px 8px',
                                        backgroundColor: mode === 'Dark' ? 'rgba(107, 114, 128, 0.3)' : '#E5E7EB',
                                        borderRadius: '10px',
                                        fontSize: '12px',
                                        color: theme.text.muted,
                                    }}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                                <Loader2 size={32} className="animate-spin" color={theme.accent.primary} />
                            </div>
                        ) : (
                            <>
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        {/* Summary Cards */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                            <SummaryCard
                                                theme={theme}
                                                mode={mode}
                                                icon={<Package size={20} />}
                                                iconColor="#3B82F6"
                                                label="Total Purchases"
                                                value={formatCurrencyValue(vendorDetail?.total_purchase_cost || 0)}
                                            />
                                            <SummaryCard
                                                theme={theme}
                                                mode={mode}
                                                icon={<CreditCard size={20} />}
                                                iconColor="#22C55E"
                                                label="Total Paid"
                                                value={formatCurrencyValue(vendorDetail?.total_paid || 0)}
                                            />
                                            <SummaryCard
                                                theme={theme}
                                                mode={mode}
                                                icon={<Clock size={20} />}
                                                iconColor="#F59E0B"
                                                label="Outstanding"
                                                value={formatCurrencyValue(vendorDetail?.total_outstanding || 0)}
                                            />
                                        </div>

                                        {/* Current Purchase Details */}
                                        <div style={{
                                            padding: '20px',
                                            backgroundColor: theme.bg.card,
                                            borderRadius: '16px',
                                            border: `1px solid ${theme.border.primary}`,
                                            display: purchase ? 'block' : 'none'
                                        }}>
                                            <h4 style={{
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                color: theme.text.secondary,
                                                marginBottom: '16px',
                                                textTransform: 'uppercase',
                                            }}>
                                                Current Purchase Details
                                            </h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                {purchase && (
                                                    <>
                                                        <DetailRow label="Product" value={purchase.product_name} theme={theme} />
                                                        <DetailRow label="Quantity" value={purchase.quantity.toString()} theme={theme} />
                                                        <DetailRow label="Unit Price" value={formatCurrencyValue(purchase.purchase_price)} theme={theme} />
                                                        <DetailRow label="Total Cost" value={formatCurrencyValue(purchase.total_cost)} theme={theme} />
                                                        <DetailRow label="Paid" value={formatCurrencyValue(purchase.paid_amount)} theme={theme} />
                                                        <DetailRow label="Outstanding" value={formatCurrencyValue(purchase.outstanding_amount)} theme={theme} />
                                                        <DetailRow
                                                            label="Status"
                                                            value={
                                                                <span style={{
                                                                    padding: '4px 12px',
                                                                    borderRadius: '12px',
                                                                    backgroundColor: mode === 'Dark' ? getStatusColor(purchase.status).darkBg : getStatusColor(purchase.status).bg,
                                                                    color: getStatusColor(purchase.status).text,
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                    textTransform: 'capitalize',
                                                                }}>
                                                                    {purchase.status.replace('_', ' ')}
                                                                </span>
                                                            }
                                                            theme={theme}
                                                        />
                                                        <DetailRow
                                                            label="Last Shipment"
                                                            value={purchase.last_shipment_received ? `✓ ${formatDate(purchase.last_shipment_date)}` : 'Pending'}
                                                            theme={theme}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '12px',
                                            padding: '20px',
                                            backgroundColor: theme.bg.card,
                                            borderRadius: '16px',
                                            border: `1px solid ${theme.border.primary}`,
                                        }}>
                                            <button
                                                onClick={() => setShowRecordPayment(true)}
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    padding: '14px 20px',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    backgroundColor: '#22C55E',
                                                    color: '#FFF',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <DollarSign size={18} />
                                                Record Payment
                                            </button>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    padding: '14px 20px',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${theme.border.primary}`,
                                                    backgroundColor: 'transparent',
                                                    color: theme.text.secondary,
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Upload size={18} />
                                                Upload Document
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                onChange={handleFileUpload}
                                                style={{ display: 'none' }}
                                                multiple
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Products Tab */}
                                {activeTab === 'products' && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text.primary }}>
                                                Products from {effectiveVendorName}
                                            </h3>
                                            <button
                                                onClick={() => setShowAddProduct(true)}
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
                                                Add Product
                                            </button>
                                        </div>

                                        {/* Add Product Form */}
                                        {showAddProduct && (
                                            <div style={{
                                                padding: '16px',
                                                backgroundColor: mode === 'Dark' ? 'rgba(15, 118, 110, 0.1)' : '#E6FAF8',
                                                borderRadius: '12px',
                                                marginBottom: '16px',
                                                display: 'flex',
                                                gap: '12px',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                            }}>
                                                <input
                                                    type="text"
                                                    placeholder="Product Name"
                                                    value={newProduct.name || ''}
                                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                    style={{
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${theme.border.primary}`,
                                                        backgroundColor: theme.bg.app,
                                                        color: theme.text.primary,
                                                        fontSize: '13px',
                                                        flex: 1,
                                                        minWidth: '150px',
                                                    }}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Unit Price"
                                                    value={newProduct.unit_price || ''}
                                                    onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) || 0 })}
                                                    style={{
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${theme.border.primary}`,
                                                        backgroundColor: theme.bg.app,
                                                        color: theme.text.primary,
                                                        fontSize: '13px',
                                                        width: '120px',
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Category"
                                                    value={newProduct.category || ''}
                                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                                    style={{
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        border: `1px solid ${theme.border.primary}`,
                                                        backgroundColor: theme.bg.app,
                                                        color: theme.text.primary,
                                                        fontSize: '13px',
                                                        width: '120px',
                                                    }}
                                                />
                                                <button
                                                    onClick={handleAddProduct}
                                                    style={{
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        backgroundColor: '#22C55E',
                                                        color: '#FFF',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { setShowAddProduct(false); setNewProduct({}); }}
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

                                        {/* Products List */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {vendorDetail?.products.length === 0 ? (
                                                <EmptyState icon={<Package size={40} />} message="No products yet" theme={theme} />
                                            ) : (
                                                vendorDetail?.products.map((product) => (
                                                    <div
                                                        key={product.id}
                                                        style={{
                                                            padding: '16px 20px',
                                                            borderRadius: '12px',
                                                            border: `1px solid ${theme.border.primary}`,
                                                            backgroundColor: theme.bg.card,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '48px',
                                                                height: '48px',
                                                                borderRadius: '10px',
                                                                backgroundColor: theme.bg.hover,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}>
                                                                <Package size={20} color={theme.text.muted} />
                                                            </div>
                                                            <div>
                                                                <p style={{ fontWeight: 600, color: theme.text.primary, margin: 0 }}>{product.name}</p>
                                                                <p style={{ fontSize: '13px', color: theme.text.muted, margin: '4px 0 0' }}>
                                                                    {product.category || 'No category'} • Added {formatDate(product.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p style={{ fontWeight: 700, color: theme.accent.primary, fontSize: '16px' }}>
                                                            {formatCurrencyValue(product.unit_price)}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Payments Tab */}
                                {activeTab === 'payments' && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text.primary }}>
                                                Payment History
                                            </h3>
                                            <button
                                                onClick={() => setShowRecordPayment(true)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '10px 16px',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    backgroundColor: '#22C55E',
                                                    color: '#FFF',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Plus size={16} />
                                                Record Payment
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {vendorDetail?.payments.length === 0 ? (
                                                <EmptyState icon={<CreditCard size={40} />} message="No payments recorded" theme={theme} />
                                            ) : (
                                                vendorDetail?.payments.map((payment) => (
                                                    <div
                                                        key={payment.id}
                                                        style={{
                                                            padding: '16px 20px',
                                                            borderRadius: '12px',
                                                            border: `1px solid ${theme.border.primary}`,
                                                            backgroundColor: theme.bg.card,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                padding: '10px',
                                                                backgroundColor: mode === 'Dark' ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
                                                                borderRadius: '10px',
                                                            }}>
                                                                <CreditCard size={20} color="#22C55E" />
                                                            </div>
                                                            <div>
                                                                <p style={{ fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                                                                    {formatCurrencyValue(payment.amount)}
                                                                </p>
                                                                <p style={{ fontSize: '13px', color: theme.text.muted, margin: '4px 0 0' }}>
                                                                    {formatDate(payment.payment_date)} • {payment.payment_method?.replace('_', ' ') || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {payment.reference_number && (
                                                            <p style={{ fontSize: '13px', color: theme.text.muted }}>
                                                                Ref: {payment.reference_number}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Shipments Tab */}
                                {activeTab === 'shipments' && (
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text.primary, marginBottom: '20px' }}>
                                            Shipment History
                                        </h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {vendorDetail?.shipments.length === 0 ? (
                                                <EmptyState icon={<Truck size={40} />} message="No shipments recorded" theme={theme} />
                                            ) : (
                                                vendorDetail?.shipments.map((shipment) => (
                                                    <div
                                                        key={shipment.id}
                                                        style={{
                                                            padding: '16px 20px',
                                                            borderRadius: '12px',
                                                            border: `1px solid ${theme.border.primary}`,
                                                            backgroundColor: theme.bg.card,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                padding: '10px',
                                                                backgroundColor: shipment.received
                                                                    ? (mode === 'Dark' ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7')
                                                                    : (mode === 'Dark' ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7'),
                                                                borderRadius: '10px',
                                                            }}>
                                                                <Truck size={20} color={shipment.received ? '#22C55E' : '#F59E0B'} />
                                                            </div>
                                                            <div>
                                                                <p style={{ fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                                                                    Shipped {formatDate(shipment.shipment_date)}
                                                                </p>
                                                                <p style={{ fontSize: '13px', color: theme.text.muted, margin: '4px 0 0' }}>
                                                                    {shipment.received
                                                                        ? `Received ${formatDate(shipment.received_date)}`
                                                                        : 'In Transit'}
                                                                    {shipment.tracking_number && ` • Track: ${shipment.tracking_number}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '12px',
                                                            backgroundColor: shipment.received
                                                                ? (mode === 'Dark' ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7')
                                                                : (mode === 'Dark' ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7'),
                                                            color: shipment.received ? '#22C55E' : '#F59E0B',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                        }}>
                                                            {shipment.received ? 'Delivered' : 'Pending'}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Attachments Tab */}
                                {activeTab === 'attachments' && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text.primary }}>
                                                Documents & Attachments
                                            </h3>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
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
                                                <Upload size={16} />
                                                Upload
                                            </button>
                                        </div>

                                        {/* Upload Zone */}
                                        <div style={{
                                            padding: '32px',
                                            border: `2px dashed ${theme.border.primary}`,
                                            borderRadius: '16px',
                                            textAlign: 'center',
                                            marginBottom: '20px',
                                            backgroundColor: theme.bg.hover,
                                        }}>
                                            <Upload size={32} style={{ margin: '0 auto 12px', color: theme.text.muted }} />
                                            <p style={{ color: theme.text.primary, fontWeight: 600, margin: '0 0 4px' }}>
                                                Drop files here or click to upload
                                            </p>
                                            <p style={{ color: theme.text.muted, fontSize: '13px', margin: 0 }}>
                                                Product images, invoices, vendor documents
                                            </p>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                            {vendorDetail?.attachments.length === 0 ? (
                                                <p style={{ color: theme.text.muted, gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
                                                    No attachments yet
                                                </p>
                                            ) : (
                                                vendorDetail?.attachments.map((attachment) => (
                                                    <div
                                                        key={attachment.id}
                                                        style={{
                                                            padding: '16px',
                                                            borderRadius: '12px',
                                                            border: `1px solid ${theme.border.primary}`,
                                                            backgroundColor: theme.bg.card,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                        }}
                                                    >
                                                        {attachment.file_type.startsWith('image/') ? (
                                                            <Image size={32} color={theme.text.muted} />
                                                        ) : (
                                                            <FileText size={32} color={theme.text.muted} />
                                                        )}
                                                        <p style={{
                                                            fontSize: '13px',
                                                            color: theme.text.primary,
                                                            margin: 0,
                                                            textAlign: 'center',
                                                            wordBreak: 'break-word',
                                                        }}>
                                                            {attachment.file_name}
                                                        </p>
                                                        <p style={{ fontSize: '12px', color: theme.text.muted, margin: 0 }}>
                                                            {(attachment.file_size / 1024).toFixed(0)} KB
                                                        </p>
                                                        <button style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            border: `1px solid ${theme.border.primary}`,
                                                            backgroundColor: 'transparent',
                                                            color: theme.text.secondary,
                                                            fontSize: '12px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                        }}>
                                                            <Download size={12} />
                                                            Download
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Profile Tab */}
                                {activeTab === 'profile' && vendorDetail && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div style={{
                                            padding: '24px',
                                            backgroundColor: theme.bg.card,
                                            borderRadius: '16px',
                                            border: `1px solid ${theme.border.primary}`,
                                        }}>
                                            <h4 style={{
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                color: theme.text.secondary,
                                                marginBottom: '20px',
                                                textTransform: 'uppercase',
                                            }}>
                                                Contact Information
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <EditableField
                                                    theme={theme}
                                                    icon={<Building2 size={18} />}
                                                    label="Company"
                                                    value={vendorDetail.name}
                                                    isEditing={editingField === 'name'}
                                                    editValue={editValue}
                                                    onEdit={() => handleInlineEdit('name', vendorDetail.name)}
                                                    onChange={setEditValue}
                                                    onSave={handleSaveEdit}
                                                    onCancel={() => setEditingField(null)}
                                                />
                                                <EditableField
                                                    theme={theme}
                                                    icon={<Mail size={18} />}
                                                    label="Email"
                                                    value={vendorDetail.email || 'Not provided'}
                                                    isEditing={editingField === 'email'}
                                                    editValue={editValue}
                                                    onEdit={() => handleInlineEdit('email', vendorDetail.email || '')}
                                                    onChange={setEditValue}
                                                    onSave={handleSaveEdit}
                                                    onCancel={() => setEditingField(null)}
                                                />
                                                <EditableField
                                                    theme={theme}
                                                    icon={<Phone size={18} />}
                                                    label="Phone"
                                                    value={vendorDetail.phone || 'Not provided'}
                                                    isEditing={editingField === 'phone'}
                                                    editValue={editValue}
                                                    onEdit={() => handleInlineEdit('phone', vendorDetail.phone || '')}
                                                    onChange={setEditValue}
                                                    onSave={handleSaveEdit}
                                                    onCancel={() => setEditingField(null)}
                                                />
                                                <EditableField
                                                    theme={theme}
                                                    icon={<MapPin size={18} />}
                                                    label="Address"
                                                    value={vendorDetail.address || 'Not provided'}
                                                    isEditing={editingField === 'address'}
                                                    editValue={editValue}
                                                    onEdit={() => handleInlineEdit('address', vendorDetail.address || '')}
                                                    onChange={setEditValue}
                                                    onSave={handleSaveEdit}
                                                    onCancel={() => setEditingField(null)}
                                                />
                                            </div>
                                        </div>

                                        <div style={{
                                            padding: '24px',
                                            backgroundColor: theme.bg.card,
                                            borderRadius: '16px',
                                            border: `1px solid ${theme.border.primary}`,
                                        }}>
                                            <h4 style={{
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                color: theme.text.secondary,
                                                marginBottom: '20px',
                                                textTransform: 'uppercase',
                                            }}>
                                                Notes
                                            </h4>
                                            <textarea
                                                value={vendorDetail.notes || ''}
                                                placeholder="Add notes about this vendor..."
                                                style={{
                                                    width: '100%',
                                                    minHeight: '150px',
                                                    padding: '12px',
                                                    borderRadius: '10px',
                                                    border: `1px solid ${theme.border.primary}`,
                                                    backgroundColor: theme.bg.app,
                                                    color: theme.text.primary,
                                                    fontSize: '14px',
                                                    resize: 'vertical',
                                                    outline: 'none',
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Modals */}
            <RecordPaymentModal
                isOpen={showRecordPayment}
                onClose={() => setShowRecordPayment(false)}
                vendorId={effectiveVendorId || ''}
                vendorName={effectiveVendorName || ''}
                invoices={[]} // Pass empty for now, or convert purchases to invoice format
                onSuccess={handlePaymentRecorded}
            />
        </AnimatePresence>
    );
};

// Helper Components
const SummaryCard: React.FC<{
    theme: any;
    mode: string;
    icon: React.ReactNode;
    iconColor: string;
    label: string;
    value: string;
}> = ({ theme, mode, icon, iconColor, label, value }) => (
    <div style={{
        padding: '20px',
        backgroundColor: theme.bg.card,
        borderRadius: '14px',
        border: `1px solid ${theme.border.primary}`,
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: mode === 'Dark' ? `${iconColor}20` : `${iconColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            marginBottom: '12px',
        }}>
            {icon}
        </div>
        <p style={{ fontSize: '12px', color: theme.text.muted, margin: '0 0 4px' }}>{label}</p>
        <p style={{ fontSize: '18px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>{value}</p>
    </div>
);

const DetailRow: React.FC<{
    label: string;
    value: string | React.ReactNode;
    theme: any;
}> = ({ label, value, theme }) => (
    <div>
        <p style={{ fontSize: '12px', color: theme.text.muted, margin: '0 0 4px' }}>{label}</p>
        <div style={{ fontSize: '14px', color: theme.text.primary, fontWeight: 500 }}>{value}</div>
    </div>
);

const EmptyState: React.FC<{
    icon: React.ReactNode;
    message: string;
    theme: any;
}> = ({ icon, message, theme }) => (
    <div style={{
        padding: '40px',
        textAlign: 'center',
        color: theme.text.muted,
        backgroundColor: theme.bg.card,
        borderRadius: '12px',
        border: `1px dashed ${theme.border.primary}`,
    }}>
        <div style={{ marginBottom: '12px', opacity: 0.5 }}>{icon}</div>
        <p style={{ margin: 0 }}>{message}</p>
    </div>
);

const EditableField: React.FC<{
    theme: any;
    icon: React.ReactNode;
    label: string;
    value: string;
    isEditing: boolean;
    editValue: string;
    onEdit: () => void;
    onChange: (v: string) => void;
    onSave: () => void;
    onCancel: () => void;
}> = ({ theme, icon, label, value, isEditing, editValue, onEdit, onChange, onSave, onCancel }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ color: theme.text.muted, marginTop: '2px' }}>{icon}</div>
        <div style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', color: theme.text.muted, margin: '0 0 4px' }}>{label}</p>
            {isEditing ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => onChange(e.target.value)}
                        autoFocus
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.accent.primary}`,
                            backgroundColor: theme.bg.app,
                            color: theme.text.primary,
                            fontSize: '14px',
                        }}
                    />
                    <button onClick={onSave} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Check size={16} color="#22C55E" />
                    </button>
                    <button onClick={onCancel} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={16} color="#EF4444" />
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '14px', color: theme.text.primary, margin: 0, fontWeight: 500 }}>{value}</p>
                    <button onClick={onEdit} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Edit3 size={14} color={theme.text.muted} />
                    </button>
                </div>
            )}
        </div>
    </div>
);
