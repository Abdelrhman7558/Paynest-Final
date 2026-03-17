import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

import {
    Search,
    Filter,
    Download,
    MoreHorizontal,
    Truck,
    MapPin,
    RefreshCw,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { ShippingDetailModal } from './ShippingDetailModal';
import { supabase } from '../../lib/supabaseClient';

// Shipment interface - matches the webhook response
export interface Shipment {
    id: string;
    trackingNumber: string;
    orderId: string;
    carrier: string;
    customerName: string;
    destination: string;
    status: string;
    shippingCost: number;
    expectedDelivery: string;
}

// Use Vite proxy to avoid CORS
const WEBHOOK_PROXY_URL = '/api/shipping';
// Direct webhook URL
const WEBHOOK_DIRECT_URL = 'https://n8n.srv1181726.hstgr.cloud/webhook-test/Shipping-tab';

// Timeout in milliseconds (20 minutes to wait for extremely large webhook data)
const FETCH_TIMEOUT = 1200000;
// Max retries
const MAX_RETRIES = 3;
// Delay between retries (ms)
const RETRY_DELAY = 3000;

interface ShippingTableProps {
    onDataLoaded?: (data: Shipment[]) => void;
    onRefresh?: () => void;
}

export const ShippingTable: React.FC<ShippingTableProps> = ({ onDataLoaded }) => {
    const { theme, mode } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('Connecting to server...');
    const abortControllerRef = useRef<AbortController | null>(null);

    // Fetch data from webhook on mount
    useEffect(() => {
        fetchShippingData();

        return () => {
            // Cleanup: abort any ongoing fetch when component unmounts
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Notify parent when data changes
    useEffect(() => {
        // Only notify if we have data or if it's explicitly explicitly empty after loading
        if (onDataLoaded && !isLoading) {
            onDataLoaded(data);
        }
    }, [data, onDataLoaded, isLoading]);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    };

    const fetchShippingData = async () => {
        setIsLoading(true);
        setError(null);
        setLoadingMessage('Connecting to server...');

        try {
            // Get current user ID from Supabase
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || 'dev-user-' + Date.now();

            console.log('=== Fetching Shipping Data ===');
            console.log('User ID:', userId);

            let shipmentData: Shipment[] = [];
            let lastError: any = null;

            // Try multiple times with retries
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                if (shipmentData.length > 0) break;

                console.log(`Attempt ${attempt}/${MAX_RETRIES}...`);
                setLoadingMessage(`Fetching data... (Attempt ${attempt}/${MAX_RETRIES})`);

                // Try 1: Vite Proxy (POST)
                try {
                    console.log('Trying Vite Proxy POST...');
                    setLoadingMessage(`Connecting via proxy... (Attempt ${attempt})`);

                    const response = await fetchWithTimeout(WEBHOOK_PROXY_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: userId,
                            timestamp: new Date().toISOString(),
                        }),
                    }, FETCH_TIMEOUT);

                    console.log('Proxy response status:', response.status);

                    if (response.ok) {
                        const result = await response.json();
                        console.log('Proxy response:', result);
                        shipmentData = parseResponse(result);
                        if (shipmentData.length > 0) {
                            console.log('SUCCESS! Got data from proxy');
                            break;
                        }
                    }
                } catch (proxyErr: any) {
                    console.log('Proxy POST failed:', proxyErr.message);
                    lastError = proxyErr;
                }

                // Try 2: Direct fetch (might work if CORS is enabled on webhook)
                if (shipmentData.length === 0) {
                    try {
                        console.log('Trying Direct POST...');
                        setLoadingMessage(`Connecting directly... (Attempt ${attempt})`);

                        const response = await fetchWithTimeout(WEBHOOK_DIRECT_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                            },
                            body: JSON.stringify({
                                user_id: userId,
                                timestamp: new Date().toISOString(),
                            }),
                        }, FETCH_TIMEOUT);

                        if (response.ok) {
                            const result = await response.json();
                            console.log('Direct response:', result);
                            shipmentData = parseResponse(result);
                            if (shipmentData.length > 0) {
                                console.log('SUCCESS! Got data from direct call');
                                break;
                            }
                        }
                    } catch (directErr: any) {
                        console.log('Direct POST failed:', directErr.message);
                        lastError = directErr;
                    }
                }

                // Wait before next retry
                if (attempt < MAX_RETRIES && shipmentData.length === 0) {
                    setLoadingMessage(`Waiting to retry... (${RETRY_DELAY / 1000}s)`);
                    await sleep(RETRY_DELAY);
                }
            }

            // Set data or show error
            if (shipmentData.length > 0) {
                console.log('SUCCESS! Got', shipmentData.length, 'shipments');
                console.log('First item:', shipmentData[0]);
                setData(shipmentData);
                setLoadingMessage('');
            } else {
                const errorMsg = lastError?.name === 'AbortError'
                    ? 'Request timed out. The webhook took too long to respond.'
                    : lastError?.message || 'Could not fetch data from webhook.';
                setError(errorMsg);
                console.error('All attempts failed:', lastError);
            }

        } catch (err: any) {
            console.error('Error fetching shipping data:', err);
            setError(err.message || 'Failed to load shipping data');
        } finally {
            setIsLoading(false);
        }
    };

    const parseResponse = (result: any): Shipment[] => {
        if (Array.isArray(result)) {
            return result;
        } else if (result && typeof result === 'object') {
            if (result.data && Array.isArray(result.data)) return result.data;
            if (result.shipments && Array.isArray(result.shipments)) return result.shipments;
            if (result.items && Array.isArray(result.items)) return result.items;
            // Check for any array property
            for (const val of Object.values(result)) {
                if (Array.isArray(val) && val.length > 0) return val as Shipment[];
            }
        }
        return [];
    };

    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase() || '';

        if (statusLower.includes('delivered') || statusLower.includes('completed')) {
            return { bg: '#DCFCE7', text: '#166534', darkBg: 'rgba(34, 197, 94, 0.2)' };
        }
        if (statusLower.includes('transit') || statusLower.includes('shipped')) {
            return { bg: '#DBEAFE', text: '#1E40AF', darkBg: 'rgba(59, 130, 246, 0.2)' };
        }
        if (statusLower.includes('returned') || statusLower.includes('cancelled')) {
            return { bg: '#FEE2E2', text: '#991B1B', darkBg: 'rgba(239, 68, 68, 0.2)' };
        }
        if (statusLower.includes('failed') || statusLower.includes('error')) {
            return { bg: '#FEF3C7', text: '#9A3412', darkBg: 'rgba(245, 158, 11, 0.2)' };
        }
        if (statusLower.includes('processing') || statusLower.includes('pending')) {
            return { bg: '#FEF9C3', text: '#A16207', darkBg: 'rgba(234, 179, 8, 0.2)' };
        }
        return { bg: '#F3F4F6', text: '#374151', darkBg: 'rgba(107, 114, 128, 0.2)' };
    };

    // Filter data based on search term
    const filteredData = data.filter(item =>
        item.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.carrier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format shipping cost
    const formatCost = (cost: number | string) => {
        const numCost = typeof cost === 'string' ? parseFloat(cost) : cost;
        if (isNaN(numCost)) return cost;
        return `EGP ${numCost.toFixed(2)}`;
    };

    return (
        <div
            style={{
                backgroundColor: theme.bg.card,
                borderRadius: '16px',
                padding: '24px',
                marginTop: '24px',
                border: `1px solid ${theme.border.primary}`,
                boxShadow: mode === 'Dark' ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
                opacity: 1,
                transform: 'none',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
        >
            {/* Table Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ color: theme.text.primary, fontSize: '18px', fontWeight: 600, margin: 0 }}>
                        Shipments & Logistics
                    </h3>
                    {data.length > 0 && (
                        <span style={{
                            padding: '4px 8px',
                            backgroundColor: mode === 'Dark' ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
                            color: '#166534',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                        }}>
                            {data.length} shipments
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color={theme.text.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Tracking # or Order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '10px 16px 10px 40px',
                                borderRadius: '12px',
                                border: `1px solid ${theme.border.primary}`,
                                backgroundColor: theme.bg.app,
                                color: theme.text.primary,
                                fontSize: '14px',
                                width: '260px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Filter Button */}
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 16px', borderRadius: '12px',
                        border: `1px solid ${theme.border.primary}`,
                        backgroundColor: theme.bg.card,
                        color: theme.text.secondary,
                        fontSize: '14px', fontWeight: 500,
                        cursor: 'pointer'
                    }}>
                        <Filter size={18} />
                        Filter
                    </button>

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

                    {/* Refresh Button */}
                    <button
                        onClick={fetchShippingData}
                        disabled={isLoading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '12px',
                            border: 'none',
                            backgroundColor: theme.status.info,
                            color: '#FFF',
                            fontSize: '14px', fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
                            opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <RefreshCw size={18} />
                        )}
                        {isLoading ? 'Loading...' : 'Sync Status'}
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 20px',
                    gap: '16px',
                }}>
                    <Loader2 size={40} color={theme.accent.primary} className="animate-spin" />
                    <p style={{ color: theme.text.secondary, fontSize: '14px', margin: 0 }}>
                        {loadingMessage}
                    </p>
                    <p style={{ color: theme.text.muted, fontSize: '12px', margin: 0 }}>
                        Please wait, this may take up to 60 seconds...
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 20px',
                    gap: '16px',
                    backgroundColor: mode === 'Dark' ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
                    borderRadius: '12px',
                }}>
                    <AlertCircle size={40} color="#EF4444" />
                    <p style={{ color: '#EF4444', fontSize: '14px', margin: 0, textAlign: 'center', maxWidth: '400px' }}>
                        {error}
                    </p>
                    <p style={{ color: theme.text.muted, fontSize: '12px', margin: 0, textAlign: 'center' }}>
                        Make sure the n8n workflow is running and the webhook is active.
                    </p>
                    <button
                        onClick={fetchShippingData}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#EF4444',
                            color: '#FFF',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && data.length === 0 && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 20px',
                    gap: '16px',
                }}>
                    <Truck size={48} color={theme.text.muted} style={{ opacity: 0.5 }} />
                    <p style={{ color: theme.text.muted, fontSize: '14px', margin: 0 }}>
                        No shipments found
                    </p>
                    <button
                        onClick={fetchShippingData}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.border.primary}`,
                            backgroundColor: 'transparent',
                            color: theme.text.secondary,
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        Refresh
                    </button>
                </div>
            )}

            {/* Table */}
            {!isLoading && !error && data.length > 0 && (
                <>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead>
                                <tr style={{ textAlign: 'left' }}>
                                    {['Tracking #', 'Carrier', 'Order ID', 'Customer', 'Destination', 'Cost', 'Status', 'Est. Delivery', 'Actions'].map((header, i) => (
                                        <th key={i} style={{
                                            padding: '16px',
                                            backgroundColor: theme.bg.hover,
                                            color: theme.text.secondary,
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderBottom: `1px solid ${theme.border.primary}`,
                                            whiteSpace: 'nowrap',
                                            borderTopLeftRadius: i === 0 ? '12px' : '0',
                                            borderBottomLeftRadius: i === 0 ? '12px' : '0',
                                            borderTopRightRadius: i === 8 ? '12px' : '0',
                                            borderBottomRightRadius: i === 8 ? '12px' : '0'
                                        }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row) => {
                                    const statusColors = getStatusColor(row.status);
                                    return (
                                        <tr key={row.id} style={{
                                            borderBottom: `1px solid ${theme.border.subtle}`,
                                            transition: 'background-color 0.2s'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bg.hover}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '16px', color: theme.text.primary, fontWeight: 500, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                <div className="flex items-center gap-2">
                                                    <Truck size={14} className="text-gray-400" />
                                                    {row.trackingNumber}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', color: theme.text.secondary, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                {row.carrier}
                                            </td>
                                            <td style={{ padding: '16px', color: theme.text.secondary, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                {row.orderId}
                                            </td>
                                            <td style={{ padding: '16px', color: theme.text.secondary, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                {row.customerName}
                                            </td>
                                            <td style={{ padding: '16px', color: theme.text.secondary, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={14} className="text-gray-400" />
                                                    {row.destination}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', color: theme.text.primary, fontWeight: 600, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                {formatCost(row.shippingCost)}
                                            </td>
                                            <td style={{ padding: '16px', borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    backgroundColor: mode === 'Dark' ? statusColors.darkBg : statusColors.bg,
                                                    color: statusColors.text,
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    display: 'inline-block'
                                                }}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', color: theme.text.secondary, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                {row.expectedDelivery}
                                            </td>
                                            <td style={{ padding: '16px', borderBottom: `1px solid ${theme.border.subtle}` }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => { setSelectedShipment(row); setShowDetailModal(true); }}
                                                        style={{ padding: '6px', cursor: 'pointer', borderRadius: '6px', border: 'none', backgroundColor: 'transparent' }}
                                                        title="View Details"
                                                    >
                                                        <MoreHorizontal size={16} color={theme.text.muted} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: theme.text.secondary }}>
                            Showing {filteredData.length} of {data.length} entries
                        </span>
                    </div>
                </>
            )}

            <ShippingDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                shipmentId={selectedShipment?.trackingNumber}
            />

        </div>
    );
};
