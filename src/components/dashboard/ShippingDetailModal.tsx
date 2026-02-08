import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, MapPin, Package, Calendar, Clock, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ShippingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipmentId?: string;
}

export const ShippingDetailModal: React.FC<ShippingDetailModalProps> = ({ isOpen, onClose, shipmentId }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'details' | 'tracking' | 'costs'>('details');

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
                        width: '800px',
                        maxWidth: '95vw',
                        height: '80vh',
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
                                <Truck size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>
                                    Shipment #{shipmentId || 'SHP-12345'}
                                </h2>
                                <p style={{ fontSize: '13px', color: theme.text.secondary, margin: 0 }}>Aramex • In Transit</p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ padding: '8px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>
                            <X size={24} color={theme.text.secondary} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div style={{ padding: '0 32px', borderBottom: `1px solid ${theme.border.primary}`, display: 'flex', gap: '32px' }}>
                        {['details', 'tracking', 'costs'].map((tab) => (
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
                        {activeTab === 'details' && (
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 style={{ color: theme.text.secondary, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '16px' }}>Destination</h4>
                                    <div className="flex gap-3 mb-4">
                                        <MapPin size={20} className="text-gray-400 mt-1" />
                                        <div>
                                            <p style={{ fontWeight: 600, color: theme.text.primary, marginBottom: '2px' }}>John Doe</p>
                                            <p style={{ color: theme.text.secondary, fontSize: '14px', lineHeight: '1.5' }}>
                                                123 Business Park, Building C<br />
                                                Dubai Silicon Oasis<br />
                                                Dubai, UAE
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ color: theme.text.secondary, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '16px' }}>Package Info</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Package size={18} className="text-gray-400" />
                                            <span style={{ color: theme.text.primary, fontSize: '14px' }}>Standard Box (2.5 kg)</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar size={18} className="text-gray-400" />
                                            <span style={{ color: theme.text.primary, fontSize: '14px' }}>Shipped: Oct 15, 2024</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock size={18} className="text-gray-400" />
                                            <span style={{ color: theme.text.primary, fontSize: '14px' }}>Est. Delivery: Oct 18, 2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'tracking' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                    <Truck size={24} className="text-blue-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">In Transit - On Time</p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300">Expected arrival by Oct 18, 2024</p>
                                    </div>
                                    <a href="#" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                                        Tracker <ExternalLink size={14} />
                                    </a>
                                </div>
                                <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8 py-2">
                                    {[
                                        { status: 'Arrived at Facility', loc: 'Dubai Distribution Center', time: 'Today, 09:30 AM', current: true },
                                        { status: 'Departed Facility', loc: 'Jebel Ali Sort Center', time: 'Yesterday, 08:15 PM', current: false },
                                        { status: 'Picked Up', loc: 'Warehouse A', time: 'Oct 15, 10:00 AM', current: false },
                                    ].map((event, i) => (
                                        <div key={i} className="pl-6 relative">
                                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${event.current ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'}`}></div>
                                            <p style={{ fontWeight: 600, color: theme.text.primary, fontSize: '14px' }}>{event.status}</p>
                                            <p style={{ color: theme.text.secondary, fontSize: '13px' }}>{event.loc}</p>
                                            <p style={{ color: theme.text.muted, fontSize: '12px', marginTop: '4px' }}>{event.time}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'costs' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-800">
                                    <span style={{ color: theme.text.secondary, fontSize: '14px' }}>Base Shipping Fee</span>
                                    <span style={{ color: theme.text.primary, fontWeight: 600 }}>$15.00</span>
                                </div>
                                <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-800">
                                    <span style={{ color: theme.text.secondary, fontSize: '14px' }}>Fuel Surcharge</span>
                                    <span style={{ color: theme.text.primary, fontWeight: 600 }}>$2.50</span>
                                </div>
                                <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-800">
                                    <span style={{ color: theme.text.secondary, fontSize: '14px' }}>Insurance</span>
                                    <span style={{ color: theme.text.primary, fontWeight: 600 }}>$5.00</span>
                                </div>
                                <div className="flex justify-between items-center p-3 pt-4">
                                    <span style={{ color: theme.text.primary, fontSize: '16px', fontWeight: 700 }}>Total Shipping Cost</span>
                                    <span style={{ color: theme.accent.primary, fontSize: '18px', fontWeight: 700 }}>$22.50</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
