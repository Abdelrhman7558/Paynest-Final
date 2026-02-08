import React, { useState } from 'react';
import { AlertTriangle, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface FailedSync {
    id: string;
    platform: string;
    platformIcon: string;
    errorMessage: string;
    failedAt: Date | string;
    retryCount: number;
}

interface FailedSyncBannerProps {
    failedSyncs: FailedSync[];
    onRetry: (syncId: string) => void;
    onRetryAll: () => void;
    onDismiss: (syncId: string) => void;
    onDismissAll: () => void;
}

export const FailedSyncBanner: React.FC<FailedSyncBannerProps> = ({
    failedSyncs,
    onRetry,
    onRetryAll,
    onDismiss,
    onDismissAll,
}) => {
    const { theme, mode } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());

    if (failedSyncs.length === 0) return null;

    const handleRetry = async (syncId: string) => {
        setRetryingIds(prev => new Set(prev).add(syncId));
        await onRetry(syncId);
        setRetryingIds(prev => {
            const next = new Set(prev);
            next.delete(syncId);
            return next;
        });
    };

    const formatTime = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div
            style={{
                backgroundColor: mode === 'Dark' ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
                border: `1px solid ${mode === 'Dark' ? 'rgba(239, 68, 68, 0.3)' : '#FECACA'}`,
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '20px',
                animation: 'slideDown 0.3s ease-out',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    cursor: failedSyncs.length > 1 ? 'pointer' : 'default',
                }}
                onClick={() => failedSyncs.length > 1 && setIsExpanded(!isExpanded)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            backgroundColor: mode === 'Dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <AlertTriangle size={22} color="#EF4444" />
                    </div>
                    <div>
                        <h4 style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: theme.text.primary,
                            margin: 0,
                        }}>
                            {failedSyncs.length === 1
                                ? `${failedSyncs[0].platform} sync failed`
                                : `${failedSyncs.length} syncs failed`
                            }
                        </h4>
                        <p style={{
                            fontSize: '13px',
                            color: theme.text.secondary,
                            margin: '2px 0 0',
                        }}>
                            {failedSyncs.length === 1
                                ? failedSyncs[0].errorMessage
                                : 'Click to view details and retry'
                            }
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {failedSyncs.length === 1 ? (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRetry(failedSyncs[0].id);
                                }}
                                disabled={retryingIds.has(failedSyncs[0].id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    backgroundColor: '#EF4444',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: '#FFFFFF',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: retryingIds.has(failedSyncs[0].id) ? 'not-allowed' : 'pointer',
                                    opacity: retryingIds.has(failedSyncs[0].id) ? 0.7 : 1,
                                }}
                            >
                                <RefreshCw
                                    size={14}
                                    style={{
                                        animation: retryingIds.has(failedSyncs[0].id) ? 'spin 1s linear infinite' : 'none',
                                    }}
                                />
                                Retry
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDismiss(failedSyncs[0].id);
                                }}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <X size={18} color={theme.text.muted} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRetryAll();
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    backgroundColor: '#EF4444',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: '#FFFFFF',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                <RefreshCw size={14} />
                                Retry All
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDismissAll();
                                }}
                                style={{
                                    padding: '8px 14px',
                                    backgroundColor: 'transparent',
                                    border: `1px solid ${theme.border.primary}`,
                                    borderRadius: '10px',
                                    color: theme.text.secondary,
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Dismiss
                            </button>
                            {isExpanded ? (
                                <ChevronUp size={18} color={theme.text.muted} />
                            ) : (
                                <ChevronDown size={18} color={theme.text.muted} />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && failedSyncs.length > 1 && (
                <div
                    style={{
                        borderTop: `1px solid ${mode === 'Dark' ? 'rgba(239, 68, 68, 0.2)' : '#FECACA'}`,
                        padding: '12px 20px',
                    }}
                >
                    {failedSyncs.map((sync, index) => (
                        <div
                            key={sync.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 0',
                                borderBottom: index < failedSyncs.length - 1
                                    ? `1px solid ${theme.border.subtle}`
                                    : 'none',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '20px' }}>{sync.platformIcon}</span>
                                <div>
                                    <p style={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: theme.text.primary,
                                        margin: 0,
                                    }}>
                                        {sync.platform}
                                    </p>
                                    <p style={{
                                        fontSize: '12px',
                                        color: theme.text.muted,
                                        margin: '2px 0 0',
                                    }}>
                                        {sync.errorMessage} • {formatTime(sync.failedAt)}
                                        {sync.retryCount > 0 && ` • ${sync.retryCount} retries`}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    onClick={() => handleRetry(sync.id)}
                                    disabled={retryingIds.has(sync.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '6px 12px',
                                        backgroundColor: mode === 'Dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#EF4444',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: retryingIds.has(sync.id) ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    <RefreshCw
                                        size={12}
                                        style={{
                                            animation: retryingIds.has(sync.id) ? 'spin 1s linear infinite' : 'none',
                                        }}
                                    />
                                    Retry
                                </button>
                                <button
                                    onClick={() => onDismiss(sync.id)}
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <X size={14} color={theme.text.muted} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CSS Keyframes */}
            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
