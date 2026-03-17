import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import type { VendorDetail, APFiltersState, PurchaseStatus } from '../../types/accountsPayable';

interface APFiltersProps {
    vendors: VendorDetail[];
    filters: APFiltersState;
    onFilterChange: (filters: APFiltersState) => void;
}

export const APFilters: React.FC<APFiltersProps> = ({ vendors, filters, onFilterChange }) => {
    const { theme, mode } = useTheme();
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const statusOptions: { value: PurchaseStatus; label: string }[] = [
        { value: 'paid', label: 'Paid' },
        { value: 'partially_paid', label: 'Partially Paid' },
        { value: 'unpaid', label: 'Unpaid' },
    ];

    const handleSearchChange = (value: string) => {
        onFilterChange({ ...filters, searchTerm: value });
    };

    const handleStatusToggle = (status: PurchaseStatus) => {
        const currentStatuses = filters.status || [];
        const newStatuses = currentStatuses.includes(status as any)
            ? currentStatuses.filter(s => s !== status)
            : [...currentStatuses, status as any];
        onFilterChange({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined });
    };

    const handleClearFilters = () => {
        onFilterChange({});
    };

    const hasActiveFilters = filters.searchTerm || (filters.status && filters.status.length > 0) || filters.vendorId;

    const buttonStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: '12px',
        border: `1px solid ${theme.border.primary}`,
        backgroundColor: theme.bg.card,
        color: theme.text.secondary,
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
    };

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            backgroundColor: theme.bg.card,
            borderRadius: '16px',
            border: `1px solid ${theme.border.primary}`,
            boxShadow: mode === 'Dark' ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
        }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
                <Search
                    size={18}
                    color={theme.text.muted}
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                    type="text"
                    placeholder="Search vendors, contacts, emails..."
                    value={filters.searchTerm || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 16px 12px 44px',
                        borderRadius: '12px',
                        border: `1px solid ${theme.border.primary}`,
                        backgroundColor: theme.bg.app,
                        color: theme.text.primary,
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                />
            </div>

            {/* Status Filter Dropdown */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    style={{
                        ...buttonStyle,
                        backgroundColor: filters.status && filters.status.length > 0
                            ? (mode === 'Dark' ? 'rgba(15, 118, 110, 0.2)' : '#E6FAF8')
                            : theme.bg.card,
                        borderColor: filters.status && filters.status.length > 0
                            ? theme.accent.primary
                            : theme.border.primary,
                    }}
                >
                    <Filter size={18} />
                    Status
                    {filters.status && filters.status.length > 0 && (
                        <span style={{
                            backgroundColor: theme.accent.primary,
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 600,
                        }}>
                            {filters.status.length}
                        </span>
                    )}
                    <ChevronDown size={16} />
                </button>

                {showStatusDropdown && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '8px',
                        backgroundColor: theme.bg.card,
                        border: `1px solid ${theme.border.primary}`,
                        borderRadius: '12px',
                        padding: '8px',
                        minWidth: '180px',
                        zIndex: 100,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }}>
                        {statusOptions.map((option) => {
                            const isSelected = filters.status?.includes(option.value as any);
                            return (
                                <label
                                    key={option.value}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                        backgroundColor: isSelected
                                            ? (mode === 'Dark' ? 'rgba(15, 118, 110, 0.2)' : '#E6FAF8')
                                            : 'transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = theme.bg.hover;
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleStatusToggle(option.value)}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            accentColor: theme.accent.primary,
                                        }}
                                    />
                                    <span style={{
                                        color: theme.text.primary,
                                        fontSize: '14px',
                                        fontWeight: isSelected ? 600 : 400,
                                    }}>
                                        {option.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <button
                    onClick={handleClearFilters}
                    style={{
                        ...buttonStyle,
                        color: '#EF4444',
                        borderColor: '#FEE2E2',
                        backgroundColor: mode === 'Dark' ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
                    }}
                >
                    <X size={16} />
                    Clear Filters
                </button>
            )}

            {/* Results Count */}
            <div style={{
                marginLeft: 'auto',
                fontSize: '13px',
                color: theme.text.muted,
                fontWeight: 500,
            }}>
                Showing {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
};
