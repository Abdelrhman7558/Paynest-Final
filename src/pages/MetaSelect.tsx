import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    AlertCircle,
    Loader2,
    ChevronLeft,
    Building2,
    ShoppingCart,
    FlaskConical,
    Check,
    ArrowRight,
    Layout,
    Shield,
    BarChart3,
    Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { validateUserId, logWebhookCall, WebhookValidationError } from '../lib/webhookUtils';

interface AdAccount {
    id: string;
    name: string;
    currency?: string;
    account_status?: number;
    timezone_name?: string;
    role?: string;
}

interface Pixel {
    id: string;
    name: string;
    ad_account_id?: string;
    last_fired_time?: string;
}

interface Catalog {
    id: string;
    name: string;
    product_count?: number;
}

interface Page {
    id: string;
    name: string;
    picture?: string;
    category?: string;
}

type Step = 1 | 2 | 3 | 4 | 5;

// Helper to get helper text for items
const getItemMeta = (item: any, type: string, t: any) => {
    switch (type) {
        case 'account':
            return (
                <div className="flex items-center gap-2 text-xs opacity-70 mt-1">
                    {item.currency && <span className="font-mono">{item.currency}</span>}
                    {item.timezone_name && <span>• {item.timezone_name}</span>}
                    {item.role && <span>• {item.role === 1 ? t('admin') : t('advertiser')}</span>}
                </div>
            );
        case 'catalog':
            return (
                <div className="flex items-center gap-2 text-xs opacity-70 mt-1">
                    {item.product_count !== undefined && <span>{item.product_count} {t('products')}</span>}
                </div>
            );
        case 'page':
            return (
                <div className="flex items-center gap-2 text-xs opacity-70 mt-1">
                    <span className="font-mono">{t('pageID')}: {item.id}</span>
                </div>
            );
        default:
            return <div className="text-xs opacity-70 mt-1 font-mono">{item.id}</div>;
    }
};

const SelectionList = ({ items, selected, onSelect, isLoading, type }: any) => {
    const { theme, mode } = useTheme();
    const { t } = useLanguage();

    return (
        <div className="space-y-4">

            <div className={`space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar`}>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p style={{ color: theme.text.secondary }}>
                            {t('fetchingAssets') || "Fetching assets..."}
                        </p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12 rounded-xl border border-dashed" style={{ borderColor: theme.border.primary, backgroundColor: mode === 'Dark' ? 'rgba(255,255,255,0.02)' : theme.bg.hover }}>
                        <p style={{ color: theme.text.secondary }} className="mb-4">{t('noItemsFound')}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 rounded-lg transition-colors text-sm font-semibold"
                            style={{ backgroundColor: theme.bg.hover, color: theme.text.primary }}
                        >
                            {t('retryConnection')}
                        </button>
                    </div>
                ) : (
                    items.map((item: any) => {
                        const isSelected = selected === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.005 }}
                                onClick={() => onSelect(item.id)}
                                className={`page-selector ${isSelected ? 'selected' : ''} group relative`}
                            >
                                <div className="facebook-icon">
                                    {type === 'page' && item.picture ? (
                                        <img src={item.picture} alt={item.name} className="w-full h-full object-cover rounded-sm" />
                                    ) : (
                                        <>
                                            {type === 'page' && <Layout className="w-5 h-5" />}
                                            {type === 'account' && <Building2 className="w-5 h-5" />}
                                            {type === 'pixel' && <FlaskConical className="w-5 h-5" />}
                                            {type === 'catalog' && <ShoppingCart className="w-5 h-5" />}
                                        </>
                                    )}
                                </div>

                                <div className="page-info text-left">
                                    <p className="page-name">
                                        {item.name}
                                    </p>
                                    <div className="page-id">
                                        {getItemMeta(item, type, t)}
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="check-icon">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </motion.button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export function MetaSelect() {
    const navigate = useNavigate();
    const { user, session, loading: authLoading } = useAuth();
    const { theme } = useTheme();
    const { t, isRTL } = useLanguage();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('user_id') || user?.id;

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [pages, setPages] = useState<Page[]>([]);
    const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
    const [pixels, setPixels] = useState<Pixel[]>([]);
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);

    const [selectedPage, setSelectedPage] = useState<string | null>(null);
    const [selectedAdAccount, setSelectedAdAccount] = useState<string | null>(null);
    const [selectedPixel, setSelectedPixel] = useState<string | null>(null);
    const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null);

    // Initialize loading to false because we want the UI to show immediately
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Fix Step 3 Pixel Logic: Reset pixels if ad account changes
    useEffect(() => {
        if (selectedAdAccount) {
            setPixels([]);
            setSelectedPixel(null);
        }
    }, [selectedAdAccount]);

    // Data Fetching Logic
    useEffect(() => {
        if (!authLoading && userId) {
            const loadStepData = async () => {
                if (currentStep === 1 && pages.length === 0) {
                    await fetchPages();
                } else if (currentStep === 2 && adAccounts.length === 0) {
                    await fetchAdAccounts();
                } else if (currentStep === 3 && pixels.length === 0 && selectedAdAccount) {
                    await fetchPixels();
                } else if (currentStep === 4 && catalogs.length === 0) {
                    await fetchCatalogs();
                }
            };
            loadStepData();
        }
    }, [currentStep, userId, authLoading, selectedAdAccount]);

    // Auth Loading Screen - Premium feel
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 transition-colors duration-300" style={{ backgroundColor: theme.bg.app }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full border"
                    style={{ backgroundColor: theme.bg.card, borderColor: theme.border.primary }}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-blue-500/10">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                    <p style={{ color: theme.text.secondary }} className="font-medium animate-pulse">{t('loading')}...</p>
                </motion.div>
            </div>
        );
    }

    if (!userId) {
        return null;
    }

    const fetchPages = async () => {
        setLoading(true);
        try {
            const validatedUserId = validateUserId(userId || undefined);

            const response = await fetch('https://n8n.srv1181726.hstgr.cloud/webhook/get-pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: validatedUserId }),
            });

            if (!response.ok) throw new Error('Failed to fetch pages');
            const result = await response.json();
            const data = Array.isArray(result) ? result[0] : result;

            if (!data || (!data.pages && !data.error)) {
                throw new Error('Pages not yet ready. Ensure n8n is set to "Respond to Webhook".');
            }

            setPages(data.pages || []);

            // Auto-select if only 1 page
            if (data.pages && data.pages.length === 1) {
                setSelectedPage(data.pages[0].id);
            }

            logWebhookCall('POST', 'pages', validatedUserId, true);
        } catch (err) {
            if (err instanceof WebhookValidationError) {
                console.error('[fetchPages] Validation error:', err.message);
            } else {
                console.error('Error fetching pages:', err);
            }
            logWebhookCall('POST', 'pages', userId || 'MISSING', false, { error: String(err) });
        } finally {
            setLoading(false);
        }
    };

    const fetchAdAccounts = async () => {
        setLoading(true);
        try {
            const validatedUserId = validateUserId(userId || undefined);

            const response = await fetch('https://n8n.srv1181726.hstgr.cloud/webhook/get-ad-accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: validatedUserId }),
            });

            if (!response.ok) throw new Error('Failed to fetch ad accounts');
            const result = await response.json();
            const data = Array.isArray(result) ? result[0] : result;

            if (!data || (!data.ad_accounts && !data.error)) {
                throw new Error('Ad Accounts not yet ready. Ensure n8n is set to "Respond to Webhook".');
            }

            setAdAccounts(data.ad_accounts || []);
            logWebhookCall('POST', 'meta-ad-accounts', validatedUserId, true);
        } catch (err) {
            if (err instanceof WebhookValidationError) {
                console.error('[fetchAdAccounts] Validation error:', err.message);
            } else {
                console.error('Error fetching ad accounts:', err);
            }
            logWebhookCall('POST', 'meta-ad-accounts', userId || 'MISSING', false, { error: String(err) });
        } finally {
            setLoading(false);
        }
    };

    const fetchPixels = async () => {
        setLoading(true);
        try {
            const validatedUserId = validateUserId(userId || undefined);

            const response = await fetch('https://n8n.srv1181726.hstgr.cloud/webhook/get-pixels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: validatedUserId, ad_account_id: selectedAdAccount || '' }),
            });

            if (!response.ok) throw new Error('Failed to fetch pixels');
            const result = await response.json();
            const data = Array.isArray(result) ? result[0] : result;

            if (!data || (!data.pixels && !data.error)) {
                throw new Error('Pixels not yet ready. Ensure n8n is set to "Respond to Webhook".');
            }

            setPixels(data.pixels || []);
            logWebhookCall('POST', 'meta-all-pixels', validatedUserId, true);
        } catch (err) {
            if (err instanceof WebhookValidationError) {
                console.error('[fetchPixels] Validation error:', err.message);
            } else {
                console.error('Error fetching pixels:', err);
            }
            logWebhookCall('POST', 'meta-all-pixels', userId || 'MISSING', false, { error: String(err) });
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalogs = async () => {
        setLoading(true);
        try {
            const validatedUserId = validateUserId(userId || undefined);
            console.log('🔄 Fetching Catalogs for User:', validatedUserId);

            // Updated to webhook-test as requested
            const response = await fetch('https://n8n.srv1181726.hstgr.cloud/webhook-test/get-catalogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: validatedUserId }),
            });

            if (!response.ok) throw new Error(`Failed to fetch catalogs: ${response.status}`);
            const result = await response.json();
            console.log('📦 Catalog API Response:', result);

            const data = Array.isArray(result) ? result[0] : result;

            if (!data || (!data.catalogs && !data.error)) {
                // Warning only, don't block if catalogs are optional? 
                // But logic says "Catalogs not yet ready".
                // We'll keep the error but log it clearly.
                console.warn('⚠️ No catalogs object in response', data);
                throw new Error('Catalogs not yet ready. Ensure n8n is set to "Respond to Webhook".');
            }

            setCatalogs(data.catalogs || []);
            logWebhookCall('POST', 'meta-all-catalogs', validatedUserId, true);
        } catch (err) {
            if (err instanceof WebhookValidationError) {
                console.error('[fetchCatalogs] Validation error:', err.message);
            } else {
                console.error('Error fetching catalogs:', err);
            }
            logWebhookCall('POST', 'meta-all-catalogs', userId || 'MISSING', false, { error: String(err) });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        setError(null);

        if (currentStep === 1 && !selectedPage) {
            setError(t('error') || 'Please select a Page');
            return;
        }

        if (currentStep === 2 && !selectedAdAccount) {
            setError(t('error') || 'Please select an Ad Account');
            return;
        }

        if (currentStep === 3 && !selectedPixel) {
            setError(t('error') || 'Please select a Pixel');
            return;
        }

        if (currentStep < 5) {
            // Note: Data clearing logic moved to useEffect dependent on state changes
            setCurrentStep((prev) => (prev + 1) as Step);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as Step);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!selectedPage || !selectedAdAccount || !selectedPixel) {
            setError(t('error') || 'Please select a Page, Ad Account, and Pixel');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const validatedUserId = validateUserId(userId || undefined);

            const selectedPageData = pages.find(p => p.id === selectedPage);
            const selectedAdAccountData = adAccounts.find(acc => acc.id === selectedAdAccount);
            const selectedPixelData = pixels.find(pix => pix.id === selectedPixel);
            const selectedCatalogData = catalogs.find(cat => cat.id === selectedCatalog);

            const payload = {
                brief_id: searchParams.get('briefId') || null,
                page_id: selectedPage,
                page_name: selectedPageData?.name || '',
                ad_account_id: selectedAdAccount,
                ad_account_name: selectedAdAccountData?.name || '',
                pixel_id: selectedPixel,
                pixel_name: selectedPixelData?.name || '',
                catalog_id: selectedCatalog || null,
                catalog_name: selectedCatalogData?.name || null,
            };



            // Send to n8n via Supabase Edge Function proxy (bypasses CORS)
            console.log('📤 Sending to n8n webhook via proxy...');
            console.log('Payload:', { user_id: validatedUserId, ...payload });

            try {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                const webhookRes = await fetch(`${supabaseUrl}/functions/v1/n8n-proxy`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token || ''}`
                    },
                    body: JSON.stringify({
                        user_id: validatedUserId,
                        ...payload
                    })
                });

                console.log('📥 Webhook response status:', webhookRes.status);

                if (webhookRes.ok) {
                    const webhookData = await webhookRes.json();
                    console.log('📥 Webhook response data:', webhookData);

                    if (webhookData.success === true) {
                        localStorage.setItem('meta_connected', 'true');
                        console.log('✅ Meta connected successfully!');
                    } else {
                        console.error('❌ Webhook returned unsuccess:', webhookData);
                        setError('Verification failed. Please try again.');
                        setSubmitting(false);
                        return; // Stop here, don't continue
                    }
                } else {
                    console.error('❌ Webhook failed with status:', webhookRes.status);
                    setError(`Connection failed: ${webhookRes.statusText}`);
                    setSubmitting(false);
                    return; // Stop here, don't continue
                }
            } catch (webhookError: any) {
                console.error('❌ Failed to call n8n webhook:', webhookError);
                setError(webhookError.message || 'Failed to connect. Check your network.');
                setSubmitting(false);
                return; // Stop here, don't continue
            }

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const response = await fetch(`${supabaseUrl}/functions/v1/save-meta-selections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || ''}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to save selections');

            const result = await response.json();
            if (result.success || result.data) {
                logWebhookCall('POST', 'meta-save-selection', validatedUserId, true);
                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                throw new Error('Failed to save selections');
            }
        } catch (err: any) {
            if (err instanceof WebhookValidationError) {
                console.error('[handleSubmit] Validation error:', err.message);
            } else {
                console.error('Error submitting selections:', err);
            }
            logWebhookCall('POST', 'meta-save-selection', userId || 'MISSING', false, { error: err.message });
            setError(err.message || 'Failed to submit selections');
        } finally {
            setSubmitting(false);
        }
    };


    const stepTitles = {
        1: { title: t('metaSelectTitle'), subtitle: t('metaSelectDescription') },
        2: { title: t('selectAdAccount'), subtitle: t('selectAdAccountDesc') },
        3: { title: t('choosePixel'), subtitle: t('choosePixelDesc') },
        4: { title: t('pickCatalog'), subtitle: t('pickCatalogDesc') },
        5: { title: t('reviewSelections'), subtitle: t('reviewSelectionsDesc') },
    };

    return (
        <div className="page-container" dir={isRTL ? 'rtl' : 'ltr'}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={currentStep === 4 ? 'catalog-card' : 'form-card'}
            >
                {/* Step Indicator */}
                {currentStep !== 4 && (
                    <div className="step-indicator">
                        {t('step')} {currentStep} / 5
                    </div>
                )}

                {/* Header */}
                <div className="mb-6">
                    <h2 className="main-title">
                        {stepTitles[currentStep].title}
                    </h2>
                    <p className="subtitle">
                        {stepTitles[currentStep].subtitle}
                    </p>
                </div>

                {/* Progress Bar (Catalog Style) */}
                {currentStep === 4 && (
                    <div className="progress-bar-container">
                        <div className="progress-steps">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <div
                                    key={step}
                                    className={`progress-step ${step <= currentStep ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 min-h-[250px] flex flex-col">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 rounded-xl border flex items-start gap-3 bg-red-50 border-red-100"
                            >
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <p className="text-sm font-medium text-red-700">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <SelectionList items={pages} selected={selectedPage} onSelect={setSelectedPage} isLoading={loading} type="page" />
                                </motion.div>
                            )}
                            {currentStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <SelectionList items={adAccounts} selected={selectedAdAccount} onSelect={setSelectedAdAccount} isLoading={loading} type="account" />
                                </motion.div>
                            )}
                            {currentStep === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <SelectionList items={pixels} selected={selectedPixel} onSelect={setSelectedPixel} isLoading={loading} type="pixel" />
                                </motion.div>
                            )}
                            {currentStep === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <SelectionList items={catalogs} selected={selectedCatalog} onSelect={setSelectedCatalog} isLoading={loading} type="catalog" />
                                </motion.div>
                            )}
                            {currentStep === 5 && (
                                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                    <ReviewItem title={t('metaSelectTitle')} value={pages.find(p => p.id === selectedPage)?.name} id={selectedPage} icon={<Layout className="w-5 h-5" />} theme={theme} />
                                    <ReviewItem title={t('selectAdAccount')} value={adAccounts.find(a => a.id === selectedAdAccount)?.name} id={selectedAdAccount} icon={<Building2 className="w-5 h-5" />} theme={theme} />
                                    <ReviewItem title={t('choosePixel')} value={pixels.find(p => p.id === selectedPixel)?.name} id={selectedPixel} icon={<FlaskConical className="w-5 h-5" />} theme={theme} />
                                    <ReviewItem title={t('pickCatalog')} value={catalogs.find(c => c.id === selectedCatalog)?.name || t('optional')} id={selectedCatalog} icon={<ShoppingCart className="w-5 h-5" />} optional theme={theme} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Trust Signal (Security Info) */}
                    {currentStep < 5 && (
                        <div className="security-info">
                            <div className="security-icon-wrapper">
                                <Shield className="w-4 h-4 text-green-600 mt-0.5" />
                            </div>
                            <div className="security-text space-y-1">
                                <p className="security-title">{t('benefitSecurity')}</p>
                                <p className="security-description">{t('benefitSecurityDesc')}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="navigation-buttons">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1 || submitting}
                        className="back-button disabled:opacity-50"
                    >
                        {isRTL ? <ArrowRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        {t('back')}
                    </button>

                    {currentStep === 5 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="continue-button disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('completingSetup')}
                                </>
                            ) : (
                                <>
                                    {t('continue')}
                                    <CheckCircle className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    ) : (
                        <div className={currentStep === 4 ? "right-buttons" : ""}>
                            {currentStep === 4 && (
                                <button
                                    onClick={() => {
                                        setSelectedCatalog(null);
                                        setCurrentStep(5);
                                    }}
                                    className="skip-button"
                                >
                                    {t('skipForNow')}
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                disabled={
                                    (currentStep === 1 && !selectedPage) ||
                                    (currentStep === 2 && !selectedAdAccount) ||
                                    (currentStep === 3 && !selectedPixel) ||
                                    loading
                                }
                                className="continue-button disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        {t('continue')}
                                        {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Why Choose Us Section (Trust Section) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="trust-section max-w-4xl w-full mx-auto"
            >
                <h3 className="trust-heading">
                    {t('whyChooseUsOnboarding')}
                </h3>
                <div className="features-grid">
                    <BenefitItem
                        icon={<BarChart3 />}
                        title={t('benefitClarity')}
                        desc={t('benefitClarityDesc')}
                    />
                    <BenefitItem
                        icon={<CheckCircle />}
                        title={t('benefitAccuracy')}
                        desc={t('benefitAccuracyDesc')}
                    />
                    <BenefitItem
                        icon={<Lock />}
                        title={t('benefitSecurity')}
                        desc={t('benefitSecurityDesc')}
                    />
                </div>
            </motion.div>
        </div>
    );
}

function ReviewItem({ title, value, id, icon, optional }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 p-4 border rounded-xl bg-gray-50 border-gray-100"
        >
            <div className="p-2.5 rounded-lg bg-white shadow-sm border border-gray-100">
                <div className="text-gray-500">
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-0.5 text-gray-500">{title}</p>
                <p className="font-semibold text-gray-900">{value}</p>
                {id && <p className="text-xs font-mono mt-0.5 opacity-60 text-gray-600">{id}</p>}
                {optional && !id && <p className="text-xs italic opacity-60 text-gray-600">Optional</p>}
            </div>
        </motion.div>
    );
}

function BenefitItem({ icon, title, desc }: any) {
    return (
        <div className="feature-item">
            <div className="feature-icon">
                {icon}
            </div>
            <h4 className="feature-title">{title}</h4>
            <p className="feature-description">{desc}</p>
        </div>
    );
}
