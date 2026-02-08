import React from 'react';
import { Check, Loader2, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'pending' | 'never';

interface SyncStatusIndicatorProps {
    status: SyncStatus;
    lastSyncTime?: Date | string | null;
    platformName?: string;
    onRetry?: () => void;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
    status,
    lastSyncTime,
    platformName: _platformName,
    onRetry,
    size = 'md',
    showLabel = true,
}) => {
    const { theme, mode } = useTheme();

    const sizes = {
        sm: { icon: 14, text: 12, padding: '4px 8px', gap: 4 },
        md: { icon: 16, text: 13, padding: '6px 12px', gap: 6 },
        lg: { icon: 20, text: 14, padding: '8px 16px', gap: 8 },
    };

    const s = sizes[size];

    const statusConfig = {
        synced: {
            icon: Check,
            color: '#22C55E',
            bgColor: mode === 'Dark' ? 'rgba(34, 197, 94, 0.12)' : '#DCFCE7',
            label: 'Synced',
        },
        syncing: {
            icon: Loader2,
            color: '#3B82F6',
            bgColor: mode === 'Dark' ? 'rgba(59, 130, 246, 0.12)' : '#DBEAFE',
            label: 'Syncing...',
        },
        error: {
            icon: AlertCircle,
            color: '#EF4444',
            bgColor: mode === 'Dark' ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2',
            label: 'Sync failed',
        },
        pending: {
            icon: Clock,
            color: '#F59E0B',
            bgColor: mode === 'Dark' ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
            label: 'Pending',
        },
        never: {
            icon: Clock,
            color: theme.text.muted,
            bgColor: mode === 'Dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            label: 'Never synced',
        },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    // Format last sync time
    const formatLastSync = () => {
        if (!lastSyncTime) return null;

        const date = typeof lastSyncTime === 'string' ? new Date(lastSyncTime) : lastSyncTime;
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: s.gap,
                padding: s.padding,
                backgroundColor: config.bgColor,
                borderRadius: '8px',
                transition: 'all 0.2s ease',
            }}
        >
            <Icon
                size={s.icon}
                color={config.color}
                style={{
                    animation: status === 'syncing' ? 'spin 1s linear infinite' : 'none',
                }}
            />

            {showLabel && (
                <span style={{
                    fontSize: s.text,
                    fontWeight: 600,
                    color: config.color,
                }}>
                    {config.label}
                </span>
            )}

            {status === 'synced' && lastSyncTime && (
                <span style={{
                    fontSize: s.text - 1,
                    color: theme.text.muted,
                    marginLeft: '2px',
                }}>
                    • {formatLastSync()}
                </span>
            )}

            {status === 'error' && onRetry && (
                <button
                    onClick={onRetry}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        color: config.color,
                        fontSize: s.text - 1,
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginLeft: '4px',
                    }}
                >
                    <RefreshCw size={s.icon - 2} />
                    Retry
                </button>
            )}

            {/* CSS for spin animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// Compact inline sync badge
interface SyncBadgeProps {
    status: SyncStatus;
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({ status }) => {
    const { mode: _mode } = useTheme();

    const colors = {
        synced: '#22C55E',
        syncing: '#3B82F6',
        error: '#EF4444',
        pending: '#F59E0B',
        never: '#94A3B8',
    };

    return (
        <span
            style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors[status],
                display: 'inline-block',
                boxShadow: status === 'syncing'
                    ? `0 0 0 3px ${colors[status]}30`
                    : 'none',
                animation: status === 'syncing' ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}
        >
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${colors[status]}40; }
                    50% { opacity: 0.8; box-shadow: 0 0 0 4px ${colors[status]}00; }
                }
            `}</style>
        </span>
    );
};
