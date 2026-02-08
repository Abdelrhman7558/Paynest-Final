import React, { useState, useEffect } from 'react';
import { Truck, X, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface CarrierConfig {
    id: string;
    name: string;
    region: string;
    description: string;
}

const CARRIERS: CarrierConfig[] = [
    { id: 'aramex', name: 'Aramex', region: 'Global', description: 'Connect Aramex for shipping rates and tracking.' },
    { id: 'bosta', name: 'Bosta', region: 'Egypt', description: 'Fast delivery solutions across Egypt.' },
    { id: 'smsa', name: 'SMSA Express', region: 'Global', description: 'Reliable shipping across the Middle East.' },
    { id: 'dhl', name: 'DHL', region: 'Global', description: 'International shipping and courier delivery services.' },
    { id: 'fedex', name: 'FedEx', region: 'Global', description: 'Fast, reliable delivery to over 220 countries.' },
    { id: 'mylerz', name: 'Mylerz', region: 'Egypt', description: 'Smart logistics for e-commerce in Egypt.' },
];

interface ConnectShippingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ConnectShippingModal: React.FC<ConnectShippingModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { theme, mode } = useTheme();
    const [selectedCarrier, setSelectedCarrier] = useState<CarrierConfig | null>(null);
    const [status, setStatus] = useState<'selection' | 'input' | 'connecting' | 'success' | 'error'>('selection');
    const [apiKey, setApiKey] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Reset state when opening/closing
    useEffect(() => {
        if (!isOpen) {
            setStatus('selection');
            setSelectedCarrier(null);
            setApiKey('');
            setErrorMsg('');
        }
    }, [isOpen]);

    const handleConnect = async () => {
        if (!selectedCarrier) return;
        if (!apiKey.trim()) {
            setErrorMsg('Please enter a valid API Key.');
            return;
        }

        setStatus('connecting');
        setErrorMsg('');

        try {
            // Prepare payload as requested: API Key + Company Name
            const payload = {
                company_name: selectedCarrier.name,
                api_key: apiKey,
                user_id: user?.id || 'unknown_user',
                timestamp: new Date().toISOString(),
                region: selectedCarrier.region
            };

            console.log('Sending payload:', payload);

            // Use the new proxy endpoint to avoid CORS
            const response = await fetch('/api/connect-shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                // Try to get error message from response
                const errorData = await response.text();
                console.error('Connection failed:', errorData);
                throw new Error('Failed to connect. Please check your API Key and try again.');
            }

            setStatus('success');

            // Auto close after success
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err: any) {
            console.error('Connection error:', err);
            setErrorMsg(err.message || 'An unexpected error occurred.');
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    // Inline Styles for "Premium" look
    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    };

    const modalStyle: React.CSSProperties = {
        backgroundColor: theme.bg.card,
        width: '100%',
        maxWidth: '600px',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        border: `1px solid ${theme.border.primary}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
    };

    const headerStyle: React.CSSProperties = {
        padding: '24px 32px',
        borderBottom: `1px solid ${theme.border.subtle}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    };

    const bodyStyle: React.CSSProperties = {
        padding: '32px',
        overflowY: 'auto',
    };

    const cardStyle: React.CSSProperties = {
        padding: '20px',
        borderRadius: '16px',
        border: `1px solid ${theme.border.primary}`,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: theme.bg.hover,
    };

    return (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={modalStyle}>

                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>
                            {status === 'selection' ? 'Connect Shipping' :
                                status === 'success' ? 'Connected Successfully' :
                                    `Connect ${selectedCarrier?.name}`}
                        </h2>
                        <p style={{ fontSize: '14px', color: theme.text.secondary, marginTop: '8px', marginBottom: 0 }}>
                            {status === 'selection' ? 'Select a provider to sync your shipments.' :
                                status === 'success' ? 'Your account has been linked.' :
                                    'Enter your API credentials securely.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text.muted }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={bodyStyle}>

                    {/* Error Message */}
                    {errorMsg && (
                        <div style={{
                            padding: '16px',
                            backgroundColor: mode === 'Dark' ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            display: 'flex',
                            gap: '12px',
                            color: '#DC2626'
                        }}>
                            <AlertCircle size={20} />
                            <span style={{ fontSize: '14px', fontWeight: 500 }}>{errorMsg}</span>
                        </div>
                    )}

                    {/* Step 1: Selection */}
                    {status === 'selection' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                            {CARRIERS.map(carrier => (
                                <div
                                    key={carrier.id}
                                    style={cardStyle}
                                    onClick={() => { setSelectedCarrier(carrier); setStatus('input'); }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                                        e.currentTarget.style.borderColor = theme.accent.primary;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = theme.border.primary;
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{
                                            padding: '10px',
                                            borderRadius: '12px',
                                            backgroundColor: theme.bg.app,
                                            color: theme.text.primary
                                        }}>
                                            <Truck size={24} />
                                        </div>
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            backgroundColor: mode === 'Dark' ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
                                            color: '#2563EB'
                                        }}>
                                            {carrier.region}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text.primary, margin: '0 0 4px 0' }}>{carrier.name}</h3>
                                        <p style={{ fontSize: '13px', color: theme.text.secondary, margin: 0, lineHeight: 1.4 }}>{carrier.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Input */}
                    {(status === 'input' || status === 'connecting' || status === 'error') && selectedCarrier && (
                        <div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: theme.text.primary, marginBottom: '8px' }}>
                                    API Key
                                </label>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={`Enter your ${selectedCarrier.name} API Key`}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: `1px solid ${theme.border.primary}`,
                                        backgroundColor: theme.bg.app,
                                        color: theme.text.primary,
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = theme.accent.primary}
                                    onBlur={(e) => e.target.style.borderColor = theme.border.primary}
                                />
                                <p style={{ fontSize: '13px', color: theme.text.muted, marginTop: '8px' }}>
                                    You can find this key in your {selectedCarrier.name} integration settings.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button
                                    onClick={() => { setStatus('selection'); setApiKey(''); }}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: `1px solid ${theme.border.primary}`,
                                        backgroundColor: 'transparent',
                                        color: theme.text.primary,
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleConnect}
                                    disabled={status === 'connecting'}
                                    style={{
                                        flex: 2,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        backgroundColor: theme.accent.primary,
                                        color: '#FFFFFF',
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        cursor: status === 'connecting' ? 'not-allowed' : 'pointer',
                                        opacity: status === 'connecting' ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {status === 'connecting' ? 'Connecting...' : 'Connect Account'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {status === 'success' && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: '#DCFCE7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px auto'
                            }}>
                                <Check size={32} color="#166534" />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.text.primary, marginBottom: '8px' }}>All Set!</h3>
                            <p style={{ fontSize: '14px', color: theme.text.secondary }}>
                                Your shipping account has been successfully connected. To close, click outside or wait a moment.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
