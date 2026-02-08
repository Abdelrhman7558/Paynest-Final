
import React, { useState, useEffect, useCallback } from 'react';

import { X, Check, CircleAlert, Loader2, Shield, ArrowRight, Store, Eye, EyeOff, Link as LinkIcon, Key } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { IntegrationService, type Integration } from '../../services/integrationService';
import { OAuthService } from '../../services/oauthService';

// Import platform logos
import shopifyLogo from '../../assets/logos/shopify.png';
import googleSheetsLogo from '../../assets/logos/google-sheets.png';
import airtableLogo from '../../assets/logos/airtable.png';
import woocommerceLogo from '../../assets/logos/woocommerce.png';
import odooLogo from '../../assets/logos/odoo.png';
import metaLogo from '/assets/meta-logo.png'; // Using absolute path to public asset
import shippingLogo from '/assets/shipping-logo.png';

// Platform configuration with brand colors and gradients
interface PlatformConfig {
    id: string;
    name: string;
    logo: string;
    description: string;
    permissions: string[];
    category: 'ecommerce' | 'spreadsheet' | 'erp' | 'api' | 'marketing' | 'logistics';
    brandColors: {
        primary: string;
        secondary: string;
        gradient: string;
        gradientHover: string;
    };
}

const PLATFORMS: PlatformConfig[] = [
    {
        id: 'shipping',
        name: 'Shipping',
        logo: shippingLogo,
        description: 'Connect DHL, FedEx, UPS & Aramex for real-time tracking.',
        permissions: ['Shipments', 'Tracking', 'Rates'],
        category: 'logistics',
        brandColors: {
            primary: '#2C3E50',
            secondary: '#1A252F',
            gradient: 'linear-gradient(135deg, rgba(44, 62, 80, 0.08) 0%, rgba(26, 37, 47, 0.12) 100%)',
            gradientHover: 'linear-gradient(135deg, rgba(44, 62, 80, 0.15) 0%, rgba(26, 37, 47, 0.20) 100%)',
        },
    },
    {
        id: 'meta',
        name: 'Meta',
        logo: metaLogo,
        description: 'Connect Facebook & Instagram Ads for marketing insights.',
        permissions: ['Ad Accounts', 'Insights', 'Pixel', 'Catalogs'],
        category: 'marketing',
        brandColors: {
            primary: '#1877F2',
            secondary: '#005AC2',
            gradient: 'linear-gradient(135deg, rgba(24, 119, 242, 0.08) 0%, rgba(0, 90, 194, 0.12) 100%)',
            gradientHover: 'linear-gradient(135deg, rgba(24, 119, 242, 0.15) 0%, rgba(0, 90, 194, 0.20) 100%)',
        },
    },
    {
        id: 'shopify',
        name: 'Shopify',
        logo: shopifyLogo,
        description: 'Sync orders, revenue, and inventory in real time.',
        permissions: ['Orders', 'Revenue', 'Refunds', 'Inventory levels', "Customers"],
        category: 'ecommerce',
        brandColors: {
            primary: '#95BF47',
            secondary: '#5E8E3E',
            gradient: 'linear-gradient(135deg, rgba(149, 191, 71, 0.08) 0%, rgba(94, 142, 62, 0.12) 100%)',
            gradientHover: 'linear-gradient(135deg, rgba(149, 191, 71, 0.15) 0%, rgba(94, 142, 62, 0.20) 100%)',
        },
    },
    {
        id: 'woocommerce',
        name: 'WooCommerce',
        logo: woocommerceLogo,
        description: 'Connect your WordPress store seamlessly.',
        permissions: ['Orders', 'Revenue', 'Products', 'Customers'],
        category: 'ecommerce',
        brandColors: {
            primary: '#9B5C8F',
            secondary: '#7F54B3',
            gradient: 'linear-gradient(135deg, rgba(155, 92, 143, 0.08) 0%, rgba(127, 84, 179, 0.12) 100%)',
            gradientHover: 'linear-gradient(135deg, rgba(155, 92, 143, 0.15) 0%, rgba(127, 84, 179, 0.20) 100%)',
        },
    },
    {
        id: 'google_sheets',
        name: 'Google Sheets',
        logo: googleSheetsLogo,
        description: 'Import structured financial data from spreadsheets.',
        permissions: ['Read spreadsheet data', 'Access file metadata'],
        category: 'spreadsheet',
        brandColors: {
            primary: '#0F9D58',
            secondary: '#34A853',
            gradient: 'linear-gradient(135deg, rgba(15, 157, 88, 0.08) 0%, rgba(52, 168, 83, 0.12) 100%)',
            gradientHover: 'linear-gradient(135deg, rgba(15, 157, 88, 0.15) 0%, rgba(52, 168, 83, 0.20) 100%)',
        },
    },
    {
        id: 'airtable',
        name: 'Airtable',
        logo: airtableLogo,
        description: 'Sync your Airtable bases automatically.',
        permissions: ['Read base data', 'Read tables', 'Read records'],
        category: 'spreadsheet',
        brandColors: {
            primary: '#FCBF49',
            secondary: '#18BFFF',
            gradient: 'linear-gradient(135deg, rgba(252, 191, 73, 0.08) 0%, rgba(24, 191, 255, 0.08) 100%)',
            gradientHover: 'linear-gradient(135deg, rgba(252, 191, 73, 0.15) 0%, rgba(24, 191, 255, 0.15) 100%)',
        },
    },
    {
        id: 'odoo',
        name: 'Odoo',
        logo: odooLogo,
        description: 'Connect your ERP for complete visibility.',
        permissions: ['Sales', 'Inventory', 'Accounting', 'Products'],
        category: 'erp',
        brandColors: {
            primary: '#875A7B',
            secondary: '#714B67',
            gradient: 'linear-gradient(135deg, rgba(135, 90, 123, 0.08) 0%, rgba(113, 75, 103, 0.12) 100%)',
            gradientHover: 'linear-gradient(135deg, rgba(135, 90, 123, 0.15) 0%, rgba(113, 75, 103, 0.20) 100%)',
        },
    },
];

interface ConnectIntegrationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadClick?: () => void;
    onOpenShipping?: () => void;
}

type ModalStep = 'platforms' | 'shopDomain' | 'wooCredentials' | 'permissions' | 'connecting' | 'success' | 'error';

export const ConnectIntegrationsModal: React.FC<ConnectIntegrationsModalProps> = ({
    isOpen,
    onClose,
    onUploadClick,
    onOpenShipping,
}) => {
    const { theme, mode } = useTheme();
    const { user } = useAuth();


    const [step, setStep] = useState<ModalStep>('platforms');
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig | null>(null);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [shopDomain, setShopDomain] = useState('');
    const [shopDomainError, setShopDomainError] = useState('');

    // WooCommerce credentials
    const [wooStoreUrl, setWooStoreUrl] = useState('');
    const [wooConsumerKey, setWooConsumerKey] = useState('');
    const [wooConsumerSecret, setWooConsumerSecret] = useState('');
    const [wooShowSecret, setWooShowSecret] = useState(false);
    const [wooErrors, setWooErrors] = useState<{ storeUrl?: string; consumerKey?: string; consumerSecret?: string; general?: string }>({});

    // Fetch existing integrations on mount
    const fetchIntegrations = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await IntegrationService.getIntegrations(user.id);
            setIntegrations(data);
        } catch (error) {
            console.error('Error fetching integrations:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (isOpen) {
            fetchIntegrations();
            setStep('platforms');
            setSelectedPlatform(null);
            setTimeout(() => setAnimateIn(true), 50);
        } else {
            setAnimateIn(false);
        }
    }, [isOpen, fetchIntegrations]);

    // Get integration status for a platform
    const getIntegrationStatus = (platformId: string): Integration | undefined => {
        return integrations.find(i => i.platform === platformId);
    };

    // Handle platform card click
    const handlePlatformClick = (platform: PlatformConfig) => {
        const existing = getIntegrationStatus(platform.id);
        if (existing?.status === 'connected') {
            return;
        }
        setSelectedPlatform(platform);

        if (platform.id === 'meta') {
            // Redirect to Meta OAuth URL
            if (!user?.id) {
                console.error('❌ User not logged in for Meta OAuth');
                return;
            }
            onClose();
            const metaClientId = '1528460524909849';
            const metaRedirectUri = 'https://n8n.srv1181726.hstgr.cloud/webhook/meta-call';
            const metaScope = 'ads_management,ads_read,business_management,pages_manage_ads';
            const metaAuthUrl = 'https://www.facebook.com/v19.0/dialog/oauth?client_id=' + metaClientId + '&redirect_uri=' + metaRedirectUri + '&scope=' + metaScope + '&state=' + user.id;
            window.location.href = metaAuthUrl;
            return;
        } else if (platform.id === 'shipping') {
            onOpenShipping?.();
            onClose();
            return;
        } else if (platform.id === 'shopify') {
            setStep('shopDomain');
            setShopDomain('');
            setShopDomainError('');
        } else if (platform.id === 'woocommerce') {
            setStep('wooCredentials');
            setWooStoreUrl('');
            setWooConsumerKey('');
            setWooConsumerSecret('');
            setWooShowSecret(false);
            setWooErrors({});
        } else if (platform.id === 'google_sheets') {
            // Direct OAuth redirect for Google Sheets
            if (!user?.id) {
                console.error('❌ User not logged in for Google Sheets OAuth');
                return;
            }
            setConnecting(true);
            setStep('connecting');
            console.log('📊 Initiating Google Sheets OAuth for user:', user.id);
            OAuthService.initiateGoogleSheetsAuth(user.id);
            return; // User will be redirected to Google
        } else {
            setStep('permissions');
        }
    };

    // Validate Shopify domain - must be exactly: storename.myshopify.com
    const validateShopDomain = (domain: string): boolean => {
        const cleaned = domain.trim().toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/\/$/, '');
        // Strict pattern: must end with .myshopify.com
        const pattern = /^([a-z0-9-]+)\.myshopify\.com$/i;
        return pattern.test(cleaned);
    };

    // Handle Shopify domain submit
    const handleShopDomainSubmit = () => {
        const cleaned = shopDomain.trim().toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/\/$/, '');

        if (!cleaned) {
            setShopDomainError('Please enter your shop domain');
            return;
        }
        if (!validateShopDomain(cleaned)) {
            setShopDomainError('Please enter a valid Shopify store domain (e.g., mystore.myshopify.com)');
            return;
        }
        setShopDomainError('');
        // Store cleaned domain before proceeding
        setShopDomain(cleaned);
        setStep('permissions');
    };

    // Validate WooCommerce Store URL
    const validateWooStoreUrl = (url: string): boolean => {
        try {
            const fullUrl = url.startsWith('https://') ? url : 'https://' + url;
            const parsed = new URL(fullUrl);
            return parsed.protocol === 'https:' && parsed.hostname.includes('.');
        } catch (e) {
            return false;
        }
    };

    // Check if WooCommerce form is valid
    const isWooFormValid = (): boolean => {
        return wooStoreUrl.trim() !== '' &&
            wooConsumerKey.trim() !== '' &&
            wooConsumerSecret.trim() !== '';
    };

    // Handle WooCommerce credentials submit
    const handleWooCredentialsSubmit = async () => {
        const errors: { storeUrl?: string; consumerKey?: string; consumerSecret?: string; general?: string } = {};

        // Validate Store URL
        if (!wooStoreUrl.trim()) {
            errors.storeUrl = 'Store URL is required';
        } else if (!validateWooStoreUrl(wooStoreUrl.trim())) {
            errors.storeUrl = 'Please enter a valid HTTPS URL';
        }

        // Validate Consumer Key
        if (!wooConsumerKey.trim()) {
            errors.consumerKey = 'Consumer Key is required';
        } else if (!wooConsumerKey.trim().startsWith('ck_')) {
            errors.consumerKey = 'Consumer Key should start with "ck_"';
        }

        // Validate Consumer Secret
        if (!wooConsumerSecret.trim()) {
            errors.consumerSecret = 'Consumer Secret is required';
        } else if (!wooConsumerSecret.trim().startsWith('cs_')) {
            errors.consumerSecret = 'Consumer Secret should start with "cs_"';
        }

        if (Object.keys(errors).length > 0) {
            setWooErrors(errors);
            return;
        }

        setWooErrors({});
        setConnecting(true);
        setStep('connecting');

        try {
            // Clean URL
            let cleanUrl = wooStoreUrl.trim().replace(/\/$/, '');
            if (!cleanUrl.startsWith('https://')) {
                cleanUrl = 'https://' + cleanUrl;
            }

            // Send to n8n webhook
            const response = await fetch('https://n8n.srv1181726.hstgr.cloud/webhook-test/woocommerce/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.id,
                    store_url: cleanUrl,
                    consumer_key: wooConsumerKey.trim(),
                    consumer_secret: wooConsumerSecret.trim(),
                }),
            });

            const result = await response.json();

            if (result.success) {
                setStep('success');
                await fetchIntegrations();
                // Clear sensitive data
                setWooConsumerKey('');
                setWooConsumerSecret('');
            } else {
                setWooErrors({ general: result.error || 'Connection failed. Please check your credentials and try again.' });
                setStep('wooCredentials');
            }
        } catch (error) {
            console.error('WooCommerce connection error:', error);
            setWooErrors({ general: 'Connection failed. Please check your credentials and try again.' });
            setStep('wooCredentials');
        } finally {
            setConnecting(false);
        }
    };

    // Handle connect action
    const handleConnect = async () => {
        console.log('🔘 handleConnect called');
        console.log('   selectedPlatform:', selectedPlatform?.id);
        console.log('   shopDomain:', shopDomain);
        console.log('   user?.id:', user?.id);

        if (!selectedPlatform) {
            console.error('❌ No platform selected');
            return;
        }

        // For Shopify, initiate OAuth redirect (doesn't require user.id)
        if (selectedPlatform.id === 'shopify' && shopDomain) {
            if (!user?.id) {
                console.error('❌ User not logged in for Shopify OAuth');
                setShopDomainError('Please log in to connect your Shopify store');
                setStep('shopDomain');
                return;
            }

            try {
                console.log('🛒 Initiating Shopify OAuth for:', shopDomain, 'User:', user.id);
                OAuthService.initiateShopifyAuth(shopDomain, user.id);
                return; // User will be redirected to Shopify
            } catch (error) {
                console.error('❌ Shopify OAuth error:', error);
                setShopDomainError(error instanceof Error ? error.message : 'Failed to connect');
                setStep('shopDomain');
                return;
            }
        }

        // For other platforms, require user.id
        if (!user?.id) {
            console.error('❌ User not logged in');
            return;
        }

        setConnecting(true);
        setStep('connecting');

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const result = await IntegrationService.saveIntegration(
                user.id,
                selectedPlatform.id,
                'connected',
                selectedPlatform.permissions
            );

            if (result) {
                setStep('success');
                await fetchIntegrations();
            } else {
                setStep('error');
            }
        } catch {
            setStep('error');
        } finally {
            setConnecting(false);
        }
    };

    // Handle close with animation
    const handleClose = () => {
        setAnimateIn(false);
        setTimeout(() => {
            setStep('platforms');
            setSelectedPlatform(null);
            onClose();
        }, 200);
    };

    if (!isOpen) return null;

    // Skeleton loader for cards
    const SkeletonCard = ({ index }: { index: number }) => (
        <div
            style={{
                backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                borderRadius: '16px',
                padding: '24px',
                height: '180px',
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: (index * 100) + 'ms',
            }}
        />
    );

    // Platform card component
    const PlatformCard: React.FC<{ platform: PlatformConfig; index: number }> = ({ platform, index }) => {
        const status = getIntegrationStatus(platform.id);
        const isConnected = status?.status === 'connected';
        const [isHovered, setIsHovered] = useState(false);

        return (
            <button
                onClick={() => handlePlatformClick(platform)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    background: isHovered ? platform.brandColors.gradientHover : platform.brandColors.gradient,
                    border: '1px solid ' + (isConnected ? platform.brandColors.primary : (mode === 'Dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')),
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    position: 'relative',
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isHovered
                        ? '0 20px 40px ' + platform.brandColors.primary + '20'
                        : '0 4px 16px rgba(0,0,0,0.06)',
                    animation: 'fadeSlideIn 0.4s ease-out',
                    animationDelay: (index * 80) + 'ms',
                    animationFillMode: 'both',
                }}
            >
                {/* Connected badge */}
                {isConnected && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: platform.brandColors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px ' + platform.brandColors.primary + '40',
                        }}
                    >
                        <Check size={16} color="#FFFFFF" strokeWidth={3} />
                    </div>
                )}

                {/* Logo */}
                <div
                    style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '12px',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        padding: '8px',
                    }}
                >
                    <img
                        src={platform.logo}
                        alt={platform.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </div>

                {/* Content */}
                <div>
                    <h3 style={{
                        fontSize: '17px',
                        fontWeight: 700,
                        color: theme.text.primary,
                        margin: 0,
                    }}>
                        {platform.name}
                    </h3>
                    <p style={{
                        fontSize: '14px',
                        color: theme.text.secondary,
                        margin: '6px 0 0',
                        lineHeight: 1.5,
                    }}>
                        {platform.description}
                    </p>
                </div>

                {/* CTA */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: platform.brandColors.primary,
                        fontSize: '14px',
                        fontWeight: 600,
                        marginTop: 'auto',
                    }}
                >
                    {isConnected ? 'Manage connection' : 'Connect'}
                    <ArrowRight size={16} />
                </div>
            </button>
        );
    };

    // Get header title based on step
    const getHeaderTitle = () => {
        switch (step) {
            case 'platforms': return 'Connect your data';
            case 'shopDomain': return 'Enter your store';
            case 'wooCredentials': return 'Connect WooCommerce';
            case 'permissions': return 'Connect ' + (selectedPlatform ? selectedPlatform.name : '') + ' ';
            case 'connecting': return 'Connecting...';
            case 'success': return 'Connected!';
            case 'error': return 'Connection failed';
            default: return '';
        }
    };

    // Get header subtitle based on step
    const getHeaderSubtitle = () => {
        switch (step) {
            case 'platforms': return 'Sync sales, costs, orders, and inventory automatically from your tools.';
            case 'shopDomain': return 'Enter your Shopify store URL to begin the connection.';
            case 'wooCredentials': return 'Enter your store credentials to securely connect.';
            case 'permissions': return 'Review the data that will be accessed.';
            case 'connecting': return 'Please wait while we establish the connection.';
            case 'success': return 'Data will sync automatically.';
            case 'error': return 'Something went wrong. Please try again.';
            default: return '';
        }
    };

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
                    maxWidth: '800px',
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
                        padding: '28px 32px 20px',
                        borderBottom: '1px solid ' + theme.border.primary,
                    }}
                >
                    <div>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: theme.text.primary,
                            margin: 0,
                            letterSpacing: '-0.02em',
                        }}>
                            {getHeaderTitle()}
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: theme.text.secondary,
                            margin: '6px 0 0',
                            lineHeight: 1.5,
                        }}>
                            {getHeaderSubtitle()}
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
                            transition: 'all 0.15s ease',
                            flexShrink: 0,
                            marginLeft: '16px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = mode === 'Dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = mode === 'Dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                    >
                        <X size={20} color={theme.text.secondary} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1 }}>
                    {/* Platforms Grid */}
                    {step === 'platforms' && (
                        <>
                            {loading ? (
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                        gap: '16px',
                                    }}
                                >
                                    {[0, 1, 2, 3, 4].map(i => <SkeletonCard key={i} index={i} />)}
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                        gap: '16px',
                                    }}
                                >
                                    {PLATFORMS.map((platform, index) => (
                                        <PlatformCard key={platform.id} platform={platform} index={index} />
                                    ))}
                                </div>
                            )}

                            {/* Upload Sheet CTA */}
                            {onUploadClick && (
                                <div
                                    style={{
                                        marginTop: '28px',
                                        padding: '20px 24px',
                                        background: mode === 'Dark'
                                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)'
                                            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%)',
                                        borderRadius: '14px',
                                        border: '1px solid ' + (mode === 'Dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: '16px',
                                    }}
                                >
                                    <div>
                                        <p style={{ fontSize: '15px', fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                                            Don't see your platform?
                                        </p>
                                        <p style={{ fontSize: '14px', color: theme.text.secondary, margin: '4px 0 0' }}>
                                            Upload an Excel or CSV file instead.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleClose();
                                            setTimeout(() => onUploadClick(), 250);
                                        }}
                                        style={{
                                            padding: '12px 24px',
                                            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            color: '#FFFFFF',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        Upload Sheet
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}

                            {/* Trust footer */}
                            <div style={{
                                marginTop: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '16px',
                                flexWrap: 'wrap',
                            }}>
                                <span style={{
                                    fontSize: '13px',
                                    color: theme.text.muted,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}>
                                    <Shield size={14} />
                                    Read-only access. Your data stays yours.
                                </span>
                                <span style={{ fontSize: '13px', color: theme.text.muted }}>•</span>
                                <span style={{ fontSize: '13px', color: theme.text.muted }}>
                                    You can disconnect anytime.
                                </span>
                            </div>
                        </>
                    )}

                    {/* Shop Domain Step */}
                    {step === 'shopDomain' && selectedPlatform && (
                        <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    marginBottom: '28px',
                                    padding: '20px',
                                    background: selectedPlatform.brandColors.gradient,
                                    borderRadius: '16px',
                                    border: '1px solid ' + selectedPlatform.brandColors.primary + '20',
                                }}
                            >
                                <div
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '14px',
                                        backgroundColor: '#FFFFFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        padding: '10px',
                                        flexShrink: 0,
                                    }}
                                >
                                    <img
                                        src={selectedPlatform.logo}
                                        alt={selectedPlatform.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>
                                        {selectedPlatform.name}
                                    </h3>
                                    <p style={{ fontSize: '15px', color: theme.text.secondary, margin: '4px 0 0' }}>
                                        {selectedPlatform.description}
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: theme.text.primary,
                                    marginBottom: '10px',
                                }}>
                                    <Store size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                    Your Shopify store URL
                                </label>
                                <input
                                    type="text"
                                    value={shopDomain}
                                    onChange={(e) => {
                                        setShopDomain(e.target.value);
                                        if (shopDomainError) setShopDomainError('');
                                    }}
                                    placeholder="yourstore.myshopify.com"
                                    style={{
                                        width: '100%',
                                        padding: '16px 18px',
                                        fontSize: '16px',
                                        border: '2px solid ' + (shopDomainError ? theme.status.cost : theme.border.primary),
                                        borderRadius: '14px',
                                        backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                                        color: theme.text.primary,
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = selectedPlatform.brandColors.primary;
                                        e.target.style.boxShadow = '0 0 0 3px ' + selectedPlatform.brandColors.primary + '20';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = shopDomainError ? theme.status.cost : theme.border.primary;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleShopDomainSubmit();
                                    }}
                                />
                                {shopDomainError && (
                                    <p style={{
                                        fontSize: '13px',
                                        color: theme.status.cost,
                                        margin: '8px 0 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}>
                                        <CircleAlert size={14} />
                                        {shopDomainError}
                                    </p>
                                )}
                            </div>

                            <div style={{
                                padding: '16px 18px',
                                backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                borderRadius: '12px',
                                border: '1px solid ' + theme.border.subtle,
                            }}>
                                <p style={{ fontSize: '14px', color: theme.text.secondary, margin: 0, lineHeight: 1.6 }}>
                                    You can find your store URL in your Shopify admin. It usually looks like <strong>yourstore.myshopify.com</strong>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* WooCommerce Credentials Step */}
                    {step === 'wooCredentials' && selectedPlatform && (
                        <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
                            {/* Header with Logo */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    marginBottom: '28px',
                                    padding: '20px',
                                    background: selectedPlatform.brandColors.gradient,
                                    borderRadius: '16px',
                                    border: '1px solid ' + selectedPlatform.brandColors.primary + '20',
                                }}
                            >
                                <div
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '14px',
                                        backgroundColor: '#FFFFFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        padding: '10px',
                                        flexShrink: 0,
                                    }}
                                >
                                    <img
                                        src={selectedPlatform.logo}
                                        alt={selectedPlatform.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>
                                        Connect WooCommerce
                                    </h3>
                                    <p style={{ fontSize: '15px', color: theme.text.secondary, margin: '4px 0 0' }}>
                                        Enter your store credentials to securely connect your WooCommerce store.
                                    </p>
                                </div>
                            </div>

                            {/* General Error Message */}
                            {wooErrors.general && (
                                <div style={{
                                    padding: '14px 16px',
                                    backgroundColor: mode === 'Dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                                    borderRadius: '12px',
                                    border: '1px solid ' + theme.status.cost + '30',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}>
                                    <CircleAlert size={18} color={theme.status.cost} />
                                    <p style={{ fontSize: '14px', color: theme.status.cost, margin: 0 }}>
                                        {wooErrors.general}
                                    </p>
                                </div>
                            )}

                            {/* Store URL Field */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: theme.text.primary,
                                    marginBottom: '10px',
                                }}>
                                    <LinkIcon size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                    Store URL
                                </label>
                                <input
                                    type="text"
                                    value={wooStoreUrl}
                                    onChange={(e) => {
                                        setWooStoreUrl(e.target.value);
                                        if (wooErrors.storeUrl) setWooErrors(prev => ({ ...prev, storeUrl: undefined }));
                                    }}
                                    placeholder="https://mystore.com"
                                    disabled={connecting}
                                    style={{
                                        width: '100%',
                                        padding: '16px 18px',
                                        fontSize: '16px',
                                        border: '2px solid ' + (wooErrors.storeUrl ? theme.status.cost : theme.border.primary),
                                        borderRadius: '14px',
                                        backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                                        color: theme.text.primary,
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                        boxSizing: 'border-box',
                                        opacity: connecting ? 0.6 : 1,
                                    }}
                                    onFocus={(e) => {
                                        if (!connecting) {
                                            e.target.style.borderColor = selectedPlatform.brandColors.primary;
                                            e.target.style.boxShadow = '0 0 0 3px ' + selectedPlatform.brandColors.primary + '20';
                                        }
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = wooErrors.storeUrl ? theme.status.cost : theme.border.primary;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <p style={{
                                    fontSize: '12px',
                                    color: wooErrors.storeUrl ? theme.status.cost : theme.text.muted,
                                    margin: '8px 0 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}>
                                    {wooErrors.storeUrl ? (
                                        <><CircleAlert size={12} /> {wooErrors.storeUrl}</>
                                    ) : (
                                        'Your WooCommerce store URL (must start with https://)'
                                    )}
                                </p>
                            </div>

                            {/* Consumer Key Field */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: theme.text.primary,
                                    marginBottom: '10px',
                                }}>
                                    <Key size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                    Consumer Key
                                </label>
                                <input
                                    type="text"
                                    value={wooConsumerKey}
                                    onChange={(e) => {
                                        setWooConsumerKey(e.target.value);
                                        if (wooErrors.consumerKey) setWooErrors(prev => ({ ...prev, consumerKey: undefined }));
                                    }}
                                    placeholder="ck_xxxxxxxxxxxxxxxxxxxxx"
                                    disabled={connecting}
                                    style={{
                                        width: '100%',
                                        padding: '16px 18px',
                                        fontSize: '16px',
                                        fontFamily: 'monospace',
                                        border: '2px solid ' + (wooErrors.consumerKey ? theme.status.cost : theme.border.primary),
                                        borderRadius: '14px',
                                        backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                                        color: theme.text.primary,
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                        boxSizing: 'border-box',
                                        opacity: connecting ? 0.6 : 1,
                                    }}
                                    onFocus={(e) => {
                                        if (!connecting) {
                                            e.target.style.borderColor = selectedPlatform.brandColors.primary;
                                            e.target.style.boxShadow = '0 0 0 3px ' + selectedPlatform.brandColors.primary + '20';
                                        }
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = wooErrors.consumerKey ? theme.status.cost : theme.border.primary;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <p style={{
                                    fontSize: '12px',
                                    color: wooErrors.consumerKey ? theme.status.cost : theme.text.muted,
                                    margin: '8px 0 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}>
                                    {wooErrors.consumerKey ? (
                                        <><CircleAlert size={12} /> {wooErrors.consumerKey}</>
                                    ) : (
                                        'Generated from WooCommerce → Settings → Advanced → REST API'
                                    )}
                                </p>
                            </div>

                            {/* Consumer Secret Field */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: theme.text.primary,
                                    marginBottom: '10px',
                                }}>
                                    <Key size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                    Consumer Secret
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={wooShowSecret ? 'text' : 'password'}
                                        value={wooConsumerSecret}
                                        onChange={(e) => {
                                            setWooConsumerSecret(e.target.value);
                                            if (wooErrors.consumerSecret) setWooErrors(prev => ({ ...prev, consumerSecret: undefined }));
                                        }}
                                        placeholder="cs_xxxxxxxxxxxxxxxxxxxxx"
                                        disabled={connecting}
                                        style={{
                                            width: '100%',
                                            padding: '16px 50px 16px 18px',
                                            fontSize: '16px',
                                            fontFamily: 'monospace',
                                            border: '2px solid ' + (wooErrors.consumerSecret ? theme.status.cost : theme.border.primary),
                                            borderRadius: '14px',
                                            backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                                            color: theme.text.primary,
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                            boxSizing: 'border-box',
                                            opacity: connecting ? 0.6 : 1,
                                        }}
                                        onFocus={(e) => {
                                            if (!connecting) {
                                                e.target.style.borderColor = selectedPlatform.brandColors.primary;
                                                e.target.style.boxShadow = '0 0 0 3px ' + selectedPlatform.brandColors.primary + '20';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = wooErrors.consumerSecret ? theme.status.cost : theme.border.primary;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setWooShowSecret(!wooShowSecret)}
                                        disabled={connecting}
                                        style={{
                                            position: 'absolute',
                                            right: '14px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: connecting ? 0.5 : 1,
                                        }}
                                    >
                                        {wooShowSecret ? (
                                            <EyeOff size={20} color={theme.text.muted} />
                                        ) : (
                                            <Eye size={20} color={theme.text.muted} />
                                        )}
                                    </button>
                                </div>
                                <p style={{
                                    fontSize: '12px',
                                    color: wooErrors.consumerSecret ? theme.status.cost : theme.text.muted,
                                    margin: '8px 0 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}>
                                    {wooErrors.consumerSecret ? (
                                        <><CircleAlert size={12} /> {wooErrors.consumerSecret}</>
                                    ) : (
                                        <>
                                            <Shield size={12} />
                                            Keep this secret. We store it securely and encrypted.
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* Connect Button */}
                            <button
                                onClick={handleWooCredentialsSubmit}
                                disabled={!isWooFormValid() || connecting}
                                style={{
                                    width: '100%',
                                    padding: '16px 24px',
                                    background: isWooFormValid() && !connecting
                                        ? 'linear-gradient(135deg, ' + selectedPlatform.brandColors.primary + ' 0%, ' + selectedPlatform.brandColors.secondary + ' 100%)'
                                        : mode === 'Dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                    border: 'none',
                                    borderRadius: '14px',
                                    color: isWooFormValid() && !connecting ? '#FFFFFF' : theme.text.muted,
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    cursor: isWooFormValid() && !connecting ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isWooFormValid() && !connecting
                                        ? '0 8px 24px ' + selectedPlatform.brandColors.primary + '40'
                                        : 'none',
                                }}
                            >
                                {connecting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        Connect Store
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            {/* Security Note */}
                            <div style={{
                                marginTop: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}>
                                <Shield size={14} color={theme.text.muted} />
                                <span style={{ fontSize: '13px', color: theme.text.muted }}>
                                    Your credentials are encrypted and never shared
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Permissions Step */}
                    {step === 'permissions' && selectedPlatform && (
                        <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    marginBottom: '28px',
                                    padding: '20px',
                                    background: selectedPlatform.brandColors.gradient,
                                    borderRadius: '16px',
                                    border: '1px solid ' + selectedPlatform.brandColors.primary + '20',
                                }}
                            >
                                <div
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '14px',
                                        backgroundColor: '#FFFFFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        padding: '10px',
                                        flexShrink: 0,
                                    }}
                                >
                                    <img
                                        src={selectedPlatform.logo}
                                        alt={selectedPlatform.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>
                                        {selectedPlatform.name}
                                    </h3>
                                    <p style={{ fontSize: '15px', color: theme.text.secondary, margin: '4px 0 0' }}>
                                        {selectedPlatform.description}
                                    </p>
                                </div>
                            </div>

                            <h4 style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                color: theme.text.primary,
                                margin: '0 0 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                                <Shield size={18} color={selectedPlatform.brandColors.primary} />
                                Data we'll access
                            </h4>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                            }}>
                                {selectedPlatform.permissions.map((permission, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '14px 16px',
                                            backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                            borderRadius: '12px',
                                            border: '1px solid ' + theme.border.subtle,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '6px',
                                                backgroundColor: selectedPlatform.brandColors.primary + '15',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Check size={14} color={selectedPlatform.brandColors.primary} />
                                        </div>
                                        <span style={{ fontSize: '15px', color: theme.text.primary }}>
                                            {permission}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                marginTop: '24px',
                                padding: '16px 18px',
                                backgroundColor: mode === 'Dark' ? 'rgba(34, 197, 94, 0.08)' : '#F0FDF4',
                                borderRadius: '12px',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}>
                                <Shield size={20} color="#22C55E" />
                                <p style={{
                                    fontSize: '14px',
                                    color: theme.text.secondary,
                                    margin: 0,
                                    lineHeight: 1.5,
                                }}>
                                    <strong style={{ color: theme.text.primary }}>Read-only access.</strong> We can only view your data, never modify or delete it.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Connecting Step */}
                    {step === 'connecting' && selectedPlatform && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px 20px',
                            animation: 'fadeSlideIn 0.3s ease-out',
                        }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '20px',
                                    backgroundColor: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 20px 40px ' + selectedPlatform.brandColors.primary + '30',
                                    marginBottom: '28px',
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                    padding: '16px',
                                }}
                            >
                                <img
                                    src={selectedPlatform.logo}
                                    alt={selectedPlatform.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            </div>
                            <Loader2
                                size={32}
                                color={selectedPlatform.brandColors.primary}
                                style={{ animation: 'spin 1s linear infinite', marginBottom: '20px' }}
                            />
                            <p style={{
                                fontSize: '16px',
                                color: theme.text.secondary,
                                textAlign: 'center',
                            }}>
                                Connecting to {selectedPlatform.name}...
                            </p>
                        </div>
                    )}

                    {/* Success Step */}
                    {step === 'success' && selectedPlatform && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px 20px',
                            animation: 'fadeSlideIn 0.3s ease-out',
                        }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    backgroundColor: selectedPlatform.brandColors.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 20px 40px ' + selectedPlatform.brandColors.primary + '40',
                                    marginBottom: '28px',
                                    animation: 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                }}
                            >
                                <Check size={40} color="#FFFFFF" strokeWidth={3} />
                            </div>
                            <h3 style={{
                                fontSize: '22px',
                                fontWeight: 700,
                                color: theme.text.primary,
                                margin: '0 0 8px',
                            }}>
                                Successfully connected!
                            </h3>
                            <p style={{
                                fontSize: '15px',
                                color: theme.text.secondary,
                                textAlign: 'center',
                                maxWidth: '300px',
                            }}>
                                Your {selectedPlatform.name} data will start syncing automatically.
                            </p>
                        </div>
                    )}

                    {/* Error Step */}
                    {step === 'error' && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px 20px',
                            animation: 'fadeSlideIn 0.3s ease-out',
                        }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    backgroundColor: theme.status.cost,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '28px',
                                }}
                            >
                                <CircleAlert size={40} color="#FFFFFF" />
                            </div>
                            <h3 style={{
                                fontSize: '22px',
                                fontWeight: 700,
                                color: theme.text.primary,
                                margin: '0 0 8px',
                            }}>
                                Connection failed
                            </h3>
                            <p style={{
                                fontSize: '15px',
                                color: theme.text.secondary,
                                textAlign: 'center',
                                maxWidth: '300px',
                            }}>
                                Something went wrong. Please try again.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: step === 'platforms' ? 'flex-end' : 'space-between',
                        padding: '20px 32px 24px',
                        borderTop: '1px solid ' + theme.border.primary,
                        gap: '12px',
                    }}
                >
                    {step === 'shopDomain' && (
                        <>
                            <button
                                onClick={() => {
                                    setStep('platforms');
                                    setSelectedPlatform(null);
                                }}
                                style={{
                                    padding: '14px 28px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid ' + theme.border.primary,
                                    borderRadius: '12px',
                                    color: theme.text.secondary,
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleShopDomainSubmit}
                                style={{
                                    padding: '14px 32px',
                                    background: 'linear-gradient(135deg, ' + selectedPlatform?.brandColors.primary + ' 0%, ' + selectedPlatform?.brandColors.secondary + ' 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#FFFFFF',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                Continue
                                <ArrowRight size={18} />
                            </button>
                        </>
                    )}

                    {step === 'permissions' && (
                        <>
                            <button
                                onClick={() => {
                                    if (selectedPlatform?.id === 'shopify') {
                                        setStep('shopDomain');
                                    } else {
                                        setStep('platforms');
                                        setSelectedPlatform(null);
                                    }
                                }}
                                style={{
                                    padding: '14px 28px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid ' + theme.border.primary,
                                    borderRadius: '12px',
                                    color: theme.text.secondary,
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConnect}
                                disabled={connecting}
                                style={{
                                    padding: '14px 32px',
                                    background: 'linear-gradient(135deg, ' + selectedPlatform?.brandColors.primary + ' 0%, ' + selectedPlatform?.brandColors.secondary + ' 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#FFFFFF',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: connecting ? 'not-allowed' : 'pointer',
                                    opacity: connecting ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                {connecting && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                                Connect {selectedPlatform?.name}
                            </button>
                        </>
                    )}

                    {(step === 'success' || step === 'error') && (
                        <button
                            onClick={handleClose}
                            style={{
                                padding: '14px 32px',
                                background: step === 'success'
                                    ? 'linear-gradient(135deg, ' + selectedPlatform?.brandColors.primary + ' 0%, ' + selectedPlatform?.brandColors.secondary + ' 100%)'
                                    : theme.accent.primary,
                                border: 'none',
                                borderRadius: '12px',
                                color: '#FFFFFF',
                                fontSize: '15px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                marginLeft: 'auto',
                            }}
                        >
                            {step === 'success' ? 'Done' : 'Close'}
                        </button>
                    )}
                </div>
            </div>

            {/* CSS Keyframes */}
            <style>{'@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }'}</style>
        </div>
    );
};
