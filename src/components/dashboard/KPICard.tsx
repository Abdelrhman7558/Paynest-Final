import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../services/dashboardApi';

export interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconBgColor: string;
    iconBgColorDark: string;
    iconColor: string;
    tooltip: string;
    isCurrency?: boolean;
    isPercentage?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    icon,
    iconBgColor,
    iconBgColorDark,
    iconColor,
    tooltip,
    isCurrency = false,
    isPercentage = false,
}) => {
    const { theme, mode } = useTheme();
    const [showTooltip, setShowTooltip] = useState(false);

    const displayValue = isCurrency && typeof value === 'number'
        ? formatCurrency(value)
        : isPercentage && typeof value === 'number'
            ? `${value.toFixed(1)}%`
            : value;

    return (
        <div
            style={{
                backgroundColor: theme.bg.card,
                borderRadius: '16px',
                padding: '24px',
                borderLeft: `4px solid ${theme.accent.primary}`,
                boxShadow: mode === 'Dark'
                    ? '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
                    : '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                minHeight: '110px',
                transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = mode === 'Dark'
                    ? '0 4px 20px rgba(0,0,0,0.4)'
                    : '0 4px 20px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = mode === 'Dark'
                    ? '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
                    : '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Left Side - Title & Value */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Title with info icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: theme.text.secondary }}>{title}</span>
                    <div
                        style={{ position: 'relative', cursor: 'help' }}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        <HelpCircle size={14} color={theme.text.muted} />
                        {showTooltip && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    bottom: '100%',
                                    transform: 'translateX(-50%)',
                                    marginBottom: '8px',
                                    padding: '8px 12px',
                                    backgroundColor: mode === 'Dark' ? '#1F2937' : '#1E293B',
                                    color: '#FFFFFF',
                                    fontSize: '12px',
                                    borderRadius: '8px',
                                    whiteSpace: 'nowrap',
                                    zIndex: 100,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                }}
                            >
                                {tooltip}
                            </div>
                        )}
                    </div>
                </div>

                {/* Value */}
                <p style={{ fontSize: '22px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>
                    {displayValue}
                </p>
            </div>

            {/* Right Side - Icon */}
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    backgroundColor: mode === 'Dark' ? iconBgColorDark : iconBgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <div style={{ color: iconColor }}>{icon}</div>
            </div>
        </div>
    );
};
