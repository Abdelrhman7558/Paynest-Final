import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
    LayoutDashboard,
    TrendingDown,
    Package,
    ShoppingCart,
    Users,
    Megaphone,
    HelpCircle,
    BarChart3,
    Settings,
    Sun,
    Moon,
    ChevronRight,
    Truck,
    CreditCard,
    Shield,
} from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
    hasSubmenu?: boolean;
    restricted?: boolean;
}

const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: 'costs', label: 'Costs', icon: <TrendingDown size={20} />, path: '/costs' },
    { id: 'inventory', label: 'Inventory', icon: <Package size={20} />, path: '/inventory' },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={20} />, path: '/orders' },
    { id: 'shipping', label: 'Shipping', icon: <Truck size={20} />, path: '/shipping' }, // New
    { id: 'accounts-payable', label: 'Accounts Payable', icon: <CreditCard size={20} />, path: '/accounts-payable' }, // New
    { id: 'ads', label: 'Ads Performance', icon: <Megaphone size={20} />, path: '/ads' },
    { id: 'customers', label: 'Customers', icon: <Users size={20} />, path: '/customers' },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} />, path: '/reports' },
    { id: 'support', label: 'Support Center', icon: <HelpCircle size={20} />, path: '/support', hasSubmenu: true },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    { id: 'manager', label: 'Manager', icon: <Shield size={20} />, path: '/manager', restricted: true }, // New
];

import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const { mode, theme, toggleTheme } = useTheme();
    const { profile, user, refreshProfile } = useAuth();

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const isActive = (path: string) => location.pathname === path;

    const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {

            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];

            // File type validation
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
                return;
            }

            // File size validation (max 2MB)
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                alert('File too large. Maximum size is 2MB.');
                return;
            }

            if (!user?.id) {
                alert('Please log in to upload an image.');
                return;
            }

            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                if (uploadError.message.includes('not found')) {
                    alert('Storage bucket not configured. Please contact support.');
                } else if (uploadError.message.includes('permission')) {
                    alert('Permission denied. Please check storage settings.');
                } else {
                    alert(`Upload failed: ${uploadError.message}`);
                }
                return;
            }

            // Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            if (!data?.publicUrl) {
                alert('Failed to generate image URL.');
                return;
            }

            // Update Profile in database
            const { error: updateError } = await supabase
                .from('user_masareefy')
                .update({ avatar_url: data.publicUrl })
                .eq('user_id', user.id);

            if (updateError) {
                console.error('Profile update error:', updateError);
                if (updateError.code === '42501') {
                    alert('Permission denied. Row Level Security may be blocking the update.');
                } else {
                    alert(`Failed to save image: ${updateError.message}`);
                }
                return;
            }

            // Refresh profile to show new avatar
            await refreshProfile();

        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert(`Error uploading image: ${error?.message || 'Unknown error'}`);
        } finally {
            // Reset file input so same file can be selected again
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    return (
        <div
            style={{
                width: '260px',
                backgroundColor: theme.bg.sidebar,
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                borderRight: `1px solid ${theme.border.primary}`,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
                transition: 'background-color 0.3s ease, border-color 0.3s ease',
            }}
        >
            {/* User Header */}
            <div style={{ padding: '24px 20px 16px', borderBottom: `1px solid ${theme.border.subtle}` }}>
                <div className="flex items-center justify-between mb-4">
                    <p style={{ fontSize: '13px', color: theme.text.secondary }}>Welcome back,</p>
                    <NotificationBell />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            position: 'relative',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            backgroundColor: theme.bg.hover,
                            border: `1px solid ${theme.border.primary}`
                        }}
                    >
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text.secondary, fontWeight: 600 }}>
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div style={{ overflow: 'hidden' }}>
                        <h1 style={{ fontSize: '16px', fontWeight: 600, color: theme.text.primary, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {displayName}
                        </h1>
                        <p style={{ fontSize: '12px', color: theme.text.secondary, margin: 0 }}>
                            {user?.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
                {menuItems.filter(item => {
                    if (item.restricted) {
                        const allowedEmails = ['7bd02025@gmail.com', 'jihadalcc@gmail.com'];
                        return user?.email && allowedEmails.includes(user.email);
                    }
                    return true;
                }).map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                marginBottom: '4px',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: 500,
                                backgroundColor: active
                                    ? (mode === 'Dark' ? 'rgba(15, 118, 110, 0.15)' : '#F0FDFA')
                                    : 'transparent',
                                color: active ? theme.accent.primary : theme.text.secondary,
                                borderLeft: active ? `3px solid ${theme.accent.primary}` : '3px solid transparent',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    e.currentTarget.style.backgroundColor = theme.bg.hover;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={{ color: active ? theme.accent.primary : theme.text.muted }}>
                                {item.icon}
                            </span>
                            <span style={{ flex: 1, color: active ? theme.accent.primary : theme.text.secondary }}>{item.label}</span>
                            {item.hasSubmenu && (
                                <ChevronRight size={16} color={theme.text.muted} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Settings */}
            <div style={{ padding: '16px 12px', borderTop: `1px solid ${theme.border.primary}` }}>
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: 'transparent',
                        transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bg.hover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {mode === 'Light' ? (
                            <Sun size={20} color={theme.text.muted} />
                        ) : (
                            <Moon size={20} color={theme.text.muted} />
                        )}
                        <span style={{ fontSize: '14px', fontWeight: 500, color: theme.text.secondary }}>Theme</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: theme.accent.primary }}>{mode}</span>
                </button>
            </div>
        </div>
    );
};
