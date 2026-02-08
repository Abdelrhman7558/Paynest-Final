import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, LogOut, Settings, RefreshCw, Link } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ConnectIntegrationsModal } from './ConnectIntegrationsModal';
import { ConnectShippingModal } from './ConnectShippingModal';
import { UploadSheetModal } from './UploadSheetModal';
import { NotificationBell } from './NotificationBell';
import { supabase } from '../../lib/supabaseClient';

interface DashboardHeaderProps {
    onRefresh: () => void;
    isLoading?: boolean;
    title?: string;
    subtitle?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    onRefresh,
    isLoading = false,
    title = "Dashboard",
    subtitle = "Here's a real-time overview of your business financial performance."
}) => {
    const { user, profile, signOut, refreshProfile } = useAuth();
    const { theme, mode } = useTheme();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showChangeMenu, setShowChangeMenu] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleSignOut = async () => {
        await signOut();
        window.location.href = '/login';
    };

    const userName = profile?.name || 'User';
    const userEmail = user?.email || 'user@example.com';
    const userInitial = userName.charAt(0).toUpperCase();
    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {

            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user?.id}/${fileName}`;

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            // Update Profile
            if (user) {
                const { error: updateError } = await supabase
                    .from('user_masareefy')
                    .update({ avatar_url: data.publicUrl })
                    .eq('user_id', user.id);

                if (updateError) throw updateError;

                await refreshProfile();
            }

        } catch (error) {
            console.error('Error uploading avatar:', error);
            const errorMessage = (error as any)?.message || 'Unknown error';
            alert(`Error uploading image: ${errorMessage}`);
        } finally {
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            style={{
                backgroundColor: theme.bg.card,
                padding: '24px 32px',
                borderBottom: `1px solid ${theme.border.primary}`,
                transition: 'background-color 0.3s ease, border-color 0.3s ease',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left Side - Title with Professional UX Copy */}
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: 700, color: theme.text.primary, margin: 0 }}>{title}</h1>
                    <p style={{ fontSize: '14px', color: theme.text.secondary, marginTop: '6px' }}>
                        {subtitle}
                    </p>
                </div>

                {/* Right Side - Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                    {/* Notification Bell */}
                    <div className="mr-2">
                        <NotificationBell />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        title="Refresh dashboard data"
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            backgroundColor: theme.status.info,
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            boxShadow: `0 2px 8px ${mode === 'Dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)'}`,
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
                        }}
                        onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <RefreshCw
                            size={18}
                            color="white"
                            style={{
                                animation: isLoading ? 'spin 1s linear infinite' : 'none',
                            }}
                        />
                    </button>

                    {/* Switch Workspace Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowChangeMenu(!showChangeMenu)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: '12px',
                                backgroundColor: theme.bg.card,
                                fontSize: '14px',
                                fontWeight: 500,
                                color: theme.text.secondary,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = theme.bg.hover;
                                e.currentTarget.style.borderColor = theme.border.subtle;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = theme.bg.card;
                                e.currentTarget.style.borderColor = theme.border.primary;
                            }}
                        >
                            Switch Workspace
                            <ChevronDown size={16} color={theme.text.muted} />
                        </button>
                        {showChangeMenu && (
                            <div
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    marginTop: '8px',
                                    width: '180px',
                                    backgroundColor: theme.bg.card,
                                    border: `1px solid ${theme.border.primary}`,
                                    borderRadius: '12px',
                                    boxShadow: mode === 'Dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)',
                                    zIndex: 50,
                                    overflow: 'hidden',
                                }}
                            >
                                {['Last 7 days', 'Last 30 days', 'Last 90 days'].map((option) => (
                                    <button
                                        key={option}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '12px 16px',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            fontSize: '14px',
                                            color: theme.text.secondary,
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bg.hover}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        onClick={() => setShowChangeMenu(false)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter Icon */}
                    <button
                        style={{
                            padding: '10px',
                            border: `1px solid ${theme.border.primary}`,
                            borderRadius: '12px',
                            backgroundColor: theme.bg.card,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.bg.hover;
                            e.currentTarget.style.borderColor = theme.border.subtle;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = theme.bg.card;
                            e.currentTarget.style.borderColor = theme.border.primary;
                        }}
                    >
                        <Filter size={18} color={theme.text.secondary} />
                    </button>

                    {/* Connect Button */}
                    <button
                        onClick={() => setShowConnectModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            backgroundColor: theme.accent.primary,
                            border: 'none',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: `0 2px 8px ${mode === 'Dark' ? 'rgba(15, 118, 110, 0.4)' : 'rgba(15, 118, 110, 0.3)'}`,
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Link size={18} />
                        Connect
                    </button>

                    {/* User Avatar */}
                    <div style={{ position: 'relative' }} ref={menuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                overflow: 'hidden', // Ensure image stays in circle
                                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
                                transition: 'transform 0.15s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '16px' }}>{userInitial}</span>
                            )}
                        </button>

                        {/* User Menu - Theme Aware */}
                        {showUserMenu && (
                            <div
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    marginTop: '12px',
                                    width: '280px',
                                    backgroundColor: theme.bg.card,
                                    border: `1px solid ${theme.border.primary}`,
                                    borderRadius: '16px',
                                    boxShadow: mode === 'Dark' ? '0 8px 30px rgba(0,0,0,0.5)' : '0 8px 30px rgba(0,0,0,0.12)',
                                    zIndex: 100,
                                    overflow: 'hidden',
                                }}
                            >
                                {/* User Info Header */}
                                <div style={{ padding: '20px', borderBottom: `1px solid ${theme.border.subtle}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            title="Click to change profile picture"
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)',
                                                cursor: 'pointer',
                                                position: 'relative'
                                            }}
                                        >
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '20px' }}>{userInitial}</span>
                                            )}

                                            {/* Hover overlay hint could be added here */}
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarUpload}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '16px', fontWeight: 600, color: theme.text.primary, margin: 0, marginBottom: '2px' }}>{userName}</p>
                                            <p style={{ fontSize: '13px', color: theme.text.secondary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div style={{ padding: '12px' }}>
                                    {/* Settings */}
                                    <button
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 14px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bg.hover}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{ width: '38px', height: '38px', backgroundColor: mode === 'Dark' ? 'rgba(168, 85, 247, 0.2)' : '#F3E8FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Settings size={18} color="#A855F7" />
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 500, color: theme.text.secondary }}>Settings</span>
                                    </button>
                                </div>

                                {/* User Details */}
                                <div style={{ padding: '0 12px 12px' }}>
                                    <div style={{ backgroundColor: theme.bg.hover, borderRadius: '10px', padding: '12px 14px', marginBottom: '8px' }}>
                                        <p style={{ fontSize: '12px', color: theme.text.muted, marginBottom: '4px' }}>User ID</p>
                                        <p style={{ fontSize: '13px', fontFamily: 'monospace', color: theme.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{user?.id || 'N/A'}</p>
                                    </div>
                                    <div style={{ backgroundColor: theme.bg.hover, borderRadius: '10px', padding: '12px 14px' }}>
                                        <p style={{ fontSize: '12px', color: theme.text.muted, marginBottom: '4px' }}>Plan</p>
                                        <p style={{ fontSize: '14px', fontWeight: 600, color: theme.accent.primary, margin: 0, textTransform: 'capitalize' }}>{profile?.plan || 'Free'}</p>
                                    </div>
                                </div>

                                {/* Logout */}
                                <div style={{ padding: '12px', borderTop: `1px solid ${theme.border.subtle}` }}>
                                    <button
                                        onClick={handleSignOut}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 14px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            backgroundColor: mode === 'Dark' ? 'rgba(220, 38, 38, 0.15)' : '#FEF2F2',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = mode === 'Dark' ? 'rgba(220, 38, 38, 0.25)' : '#FEE2E2'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = mode === 'Dark' ? 'rgba(220, 38, 38, 0.15)' : '#FEF2F2'}
                                    >
                                        <div style={{ width: '38px', height: '38px', backgroundColor: mode === 'Dark' ? 'rgba(220, 38, 38, 0.2)' : '#FECACA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <LogOut size={18} color={theme.status.cost} />
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: theme.status.cost }}>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Modals */}
            <ConnectIntegrationsModal
                isOpen={showConnectModal}
                onClose={() => setShowConnectModal(false)}
                onUploadClick={() => setShowUploadModal(true)}
                onOpenShipping={() => {
                    setShowConnectModal(false);
                    setTimeout(() => setShowShippingModal(true), 100);
                }}
            />
            <ConnectShippingModal
                isOpen={showShippingModal}
                onClose={() => setShowShippingModal(false)}
            />
            <UploadSheetModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
            />

            {/* CSS Keyframes for spin animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
