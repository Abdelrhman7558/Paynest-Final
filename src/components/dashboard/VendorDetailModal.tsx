import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Plus, Check, DollarSign, Calendar, Clock, Download } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface VendorDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId?: string; // If editing
}

export const VendorDetailModal: React.FC<VendorDetailModalProps> = ({ isOpen, onClose, vendorId }) => {
    const { theme, mode } = useTheme();
    const [activeTab, setActiveTab] = useState<'profile' | 'invoices' | 'payments' | 'settings'>('profile');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Mock functionality for Invoice Upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Mock parsing logic
            alert(`Simulating parsing for: ${file.name}`);
            setTimeout(() => {
                alert("Invoice parsed! Total: $1,250.00. Vendor: Global Suppliers Ltd.");
                setIsUploadModalOpen(false);
            }, 1500);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                        backgroundColor: theme.bg.card,
                        width: '900px',
                        maxWidth: '95vw',
                        height: '85vh',
                        borderRadius: '24px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: `1px solid ${theme.border.primary}`,
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '24px 32px', borderBottom: `1px solid ${theme.border.primary}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        backgroundColor: theme.bg.hover
                    }}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                G
                            </div>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>
                                    Global Suppliers Ltd
                                </h2>
                                <p style={{ fontSize: '13px', color: theme.text.secondary, margin: 0 }}>ID: VND-2023-001</p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ padding: '8px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                            <X size={24} color={theme.text.secondary} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div style={{ padding: '0 32px', borderBottom: `1px solid ${theme.border.primary}`, display: 'flex', gap: '32px' }}>
                        {['profile', 'invoices', 'payments', 'settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                style={{
                                    padding: '16px 0',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: activeTab === tab ? theme.accent.primary : theme.text.muted,
                                    borderBottom: activeTab === tab ? `2px solid ${theme.accent.primary}` : '2px solid transparent',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                        {activeTab === 'invoices' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.text.primary }}>Invoice History</h3>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => alert("Manual Entry Modal Placeholder")}
                                            className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            style={{ color: theme.text.secondary }}
                                        >
                                            + Manual Entry
                                        </button>
                                        <button
                                            onClick={() => setIsUploadModalOpen(true)}
                                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <Upload size={16} />
                                            Upload Invoice
                                        </button>
                                    </div>
                                </div>

                                {/* Placeholder for Invoice Upload Modal */}
                                {isUploadModalOpen && (
                                    <div style={{
                                        marginBottom: '24px', padding: '24px', border: `2px dashed ${theme.border.primary}`, borderRadius: '16px',
                                        backgroundColor: theme.bg.hover, textAlign: 'center'
                                    }}>
                                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                            <Upload size={24} />
                                        </div>
                                        <h4 style={{ color: theme.text.primary, fontWeight: 600, marginBottom: '8px' }}>Upload Invoice File</h4>
                                        <p style={{ color: theme.text.secondary, fontSize: '14px', marginBottom: '16px' }}>PDF, JPG, PNG, or Excel. We'll extract the data automatically.</p>
                                        <input type="file" onChange={handleFileUpload} style={{ textIndent: '-999px', width: '100px', margin: '0 auto' }} />
                                    </div>
                                )}

                                {/* Invoices List */}
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} style={{
                                            padding: '16px', borderRadius: '12px', border: `1px solid ${theme.border.primary}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            backgroundColor: theme.bg.card
                                        }}>
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                    <FileText size={20} className="text-gray-500" />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, color: theme.text.primary, fontSize: '14px' }}>Invoice #{2024000 + i}</p>
                                                    <p style={{ color: theme.text.secondary, fontSize: '12px' }}>Oct {10 + i}, 2024 • Goods Purchase</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <p style={{ fontWeight: 700, color: theme.text.primary }}>$1,250.00</p>
                                                    <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full inline-block">Paid</p>
                                                </div>
                                                <button style={{ padding: '6px', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent' }}>
                                                    <Download size={16} color={theme.text.muted} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 style={{ color: theme.text.secondary, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Contact Information</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: theme.text.muted }}>Email Address</label>
                                            <input type="text" value="billing@globalsuppliers.com" readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border.primary}`, backgroundColor: theme.bg.app, color: theme.text.primary, marginTop: '4px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: theme.text.muted }}>Phone Number</label>
                                            <input type="text" value="+1 (555) 123-4567" readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border.primary}`, backgroundColor: theme.bg.app, color: theme.text.primary, marginTop: '4px' }} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ color: theme.text.secondary, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Financial Settings</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: theme.text.muted }}>Currency</label>
                                            <input type="text" value="USD - US Dollar" readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border.primary}`, backgroundColor: theme.bg.app, color: theme.text.primary, marginTop: '4px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', color: theme.text.muted }}>Payment Terms</label>
                                            <input type="text" value="Net 30" readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border.primary}`, backgroundColor: theme.bg.app, color: theme.text.primary, marginTop: '4px' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
