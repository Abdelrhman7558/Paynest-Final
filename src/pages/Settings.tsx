import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Camera,
    Globe,
    Clock,
    DollarSign,
    Calendar,
    Lock,
    Eye,
    EyeOff,
    Save,
    Check,
    AlertCircle,
    Loader2,
} from 'lucide-react';

// ================== TYPES ==================

interface ProfileData {
    name: string;
    language: string;
    timezone: string;
}

interface PreferencesData {
    currency: string;
    date_format: string;
    notifications_enabled: boolean;
}

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// ================== CONSTANTS ==================

const TIMEZONES = [
    { value: 'Africa/Cairo', label: 'Cairo (GMT+2)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
    { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
];

const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية (Arabic)' },
];

const CURRENCIES = [
    { value: 'EGP', label: 'EGP - Egyptian Pound' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
    { value: 'AED', label: 'AED - UAE Dirham' },
];

const DATE_FORMATS = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

// ================== TOAST COMPONENT ==================

const Toast: React.FC<{
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
                position: 'fixed',
                top: 20,
                right: 20,
                padding: '12px 20px',
                borderRadius: 8,
                backgroundColor: type === 'success' ? '#10B981' : '#EF4444',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
        >
            {type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span style={{ fontSize: 14, fontWeight: 500 }}>{message}</span>
        </motion.div>
    );
};

// ================== SECTION CARD COMPONENT ==================

const SectionCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    theme: any;
}> = ({ title, icon, children, theme }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                backgroundColor: theme.bg.card,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: theme.bg.hover,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.accent.primary,
                }}>
                    {icon}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                    {title}
                </h2>
            </div>
            {children}
        </motion.div>
    );
};

// ================== FORM INPUT COMPONENT ==================

const FormInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    disabled?: boolean;
    placeholder?: string;
    icon?: React.ReactNode;
    theme: any;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
}> = ({ label, value, onChange, type = 'text', disabled, placeholder, icon, theme, rightIcon, onRightIconClick }) => {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: theme.text.secondary,
                marginBottom: 6,
            }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                {icon && (
                    <div style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: theme.text.muted,
                    }}>
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        paddingLeft: icon ? 40 : 12,
                        paddingRight: rightIcon ? 40 : 12,
                        border: `1px solid ${theme.border.primary}`,
                        borderRadius: 8,
                        backgroundColor: disabled ? theme.bg.hover : theme.bg.app,
                        color: theme.text.primary,
                        fontSize: 14,
                        outline: 'none',
                        opacity: disabled ? 0.7 : 1,
                        cursor: disabled ? 'not-allowed' : 'text',
                    }}
                />
                {rightIcon && (
                    <button
                        type="button"
                        onClick={onRightIconClick}
                        style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: theme.text.muted,
                            padding: 0,
                        }}
                    >
                        {rightIcon}
                    </button>
                )}
            </div>
        </div>
    );
};

// ================== FORM SELECT COMPONENT ==================

const FormSelect: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    icon?: React.ReactNode;
    theme: any;
}> = ({ label, value, onChange, options, icon, theme }) => {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: theme.text.secondary,
                marginBottom: 6,
            }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                {icon && (
                    <div style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: theme.text.muted,
                        pointerEvents: 'none',
                    }}>
                        {icon}
                    </div>
                )}
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        paddingLeft: icon ? 40 : 12,
                        border: `1px solid ${theme.border.primary}`,
                        borderRadius: 8,
                        backgroundColor: theme.bg.app,
                        color: theme.text.primary,
                        fontSize: 14,
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                    }}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

// ================== TOGGLE COMPONENT ==================

const Toggle: React.FC<{
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    theme: any;
}> = ({ label, description, checked, onChange, theme }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: `1px solid ${theme.border.subtle}`,
        }}>
            <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: theme.text.primary, margin: 0 }}>
                    {label}
                </p>
                {description && (
                    <p style={{ fontSize: 12, color: theme.text.muted, margin: '4px 0 0' }}>
                        {description}
                    </p>
                )}
            </div>
            <button
                onClick={() => onChange(!checked)}
                style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: checked ? theme.accent.primary : theme.bg.hover,
                    border: `1px solid ${checked ? theme.accent.primary : theme.border.primary}`,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                }}
            >
                <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    top: 2,
                    left: checked ? 22 : 2,
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
            </button>
        </div>
    );
};

// ================== SAVE BUTTON COMPONENT ==================

const SaveButton: React.FC<{
    onClick: () => void;
    loading: boolean;
    disabled: boolean;
    theme: any;
}> = ({ onClick, loading, disabled, theme }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                backgroundColor: disabled ? theme.bg.hover : theme.accent.primary,
                color: disabled ? theme.text.muted : 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                marginTop: 16,
            }}
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? 'Saving...' : 'Save Changes'}
        </button>
    );
};

// ================== MAIN SETTINGS PAGE ==================

export const Settings: React.FC = () => {
    const { theme } = useTheme();
    const { user, profile, refreshProfile } = useAuth();

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Profile section state
    const [profileData, setProfileData] = useState<ProfileData>({
        name: '',
        language: 'en',
        timezone: 'Africa/Cairo',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileChanged, setProfileChanged] = useState(false);

    // Avatar state
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = React.useRef<HTMLInputElement>(null);

    // Preferences section state
    const [preferencesData, setPreferencesData] = useState<PreferencesData>({
        currency: 'EGP',
        date_format: 'DD/MM/YYYY',
        notifications_enabled: true,
    });
    const [preferencesLoading, setPreferencesLoading] = useState(false);
    const [preferencesChanged, setPreferencesChanged] = useState(false);

    // Security section state
    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Load profile data
    useEffect(() => {
        if (profile) {
            setProfileData({
                name: profile.name || '',
                language: profile.language || 'en',
                timezone: profile.timezone || 'Africa/Cairo',
            });
            setPreferencesData({
                currency: profile.currency || 'EGP',
                date_format: profile.date_format || 'DD/MM/YYYY',
                notifications_enabled: profile.notifications_enabled ?? true,
            });
        }
    }, [profile]);

    // Check for changes
    useEffect(() => {
        if (profile) {
            const hasProfileChanges =
                profileData.name !== (profile.name || '') ||
                profileData.language !== (profile.language || 'en') ||
                profileData.timezone !== (profile.timezone || 'Africa/Cairo');
            setProfileChanged(hasProfileChanges);

            const hasPreferencesChanges =
                preferencesData.currency !== (profile.currency || 'EGP') ||
                preferencesData.date_format !== (profile.date_format || 'DD/MM/YYYY') ||
                preferencesData.notifications_enabled !== (profile.notifications_enabled ?? true);
            setPreferencesChanged(hasPreferencesChanges);
        }
    }, [profileData, preferencesData, profile]);

    // Handle avatar upload
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setAvatarUploading(true);
            if (!event.target.files || event.target.files.length === 0) return;

            const file = event.target.files[0];

            // Validations
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setToast({ message: 'Invalid file type. Use JPG, PNG, GIF, or WebP.', type: 'error' });
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setToast({ message: 'File too large. Maximum size is 2MB.', type: 'error' });
                return;
            }

            if (!user?.id) {
                setToast({ message: 'Please log in to upload.', type: 'error' });
                return;
            }

            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadError) {
                setToast({ message: `Upload failed: ${uploadError.message}`, type: 'error' });
                return;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('user_masareefy')
                .update({ avatar_url: data.publicUrl })
                .eq('user_id', user.id);

            if (updateError) {
                setToast({ message: `Failed to save: ${updateError.message}`, type: 'error' });
                return;
            }

            await refreshProfile();
            setToast({ message: 'Profile picture updated!', type: 'success' });

        } catch (error: any) {
            setToast({ message: error?.message || 'Upload failed', type: 'error' });
        } finally {
            setAvatarUploading(false);
            if (event.target) event.target.value = '';
        }
    };

    // Save profile
    const handleSaveProfile = async () => {
        if (!user?.id) return;
        setProfileLoading(true);

        try {
            const { error } = await supabase
                .from('user_masareefy')
                .update({
                    name: profileData.name,
                    language: profileData.language,
                    timezone: profileData.timezone,
                })
                .eq('user_id', user.id);

            if (error) throw error;

            await refreshProfile();
            setToast({ message: 'Profile saved successfully!', type: 'success' });
            setProfileChanged(false);
        } catch (error: any) {
            setToast({ message: error?.message || 'Failed to save profile', type: 'error' });
        } finally {
            setProfileLoading(false);
        }
    };

    // Save preferences
    const handleSavePreferences = async () => {
        if (!user?.id) return;
        setPreferencesLoading(true);

        try {
            const { error } = await supabase
                .from('user_masareefy')
                .update({
                    currency: preferencesData.currency,
                    date_format: preferencesData.date_format,
                    notifications_enabled: preferencesData.notifications_enabled,
                })
                .eq('user_id', user.id);

            if (error) throw error;

            await refreshProfile();
            setToast({ message: 'Preferences saved successfully!', type: 'success' });
            setPreferencesChanged(false);
        } catch (error: any) {
            setToast({ message: error?.message || 'Failed to save preferences', type: 'error' });
        } finally {
            setPreferencesLoading(false);
        }
    };

    // Change password
    const handleChangePassword = async () => {
        if (!passwordData.newPassword || !passwordData.confirmPassword) {
            setToast({ message: 'Please fill in all password fields', type: 'error' });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setToast({ message: 'New passwords do not match', type: 'error' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setToast({ message: 'Password must be at least 6 characters', type: 'error' });
            return;
        }

        setPasswordLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword,
            });

            if (error) throw error;

            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setToast({ message: 'Password changed successfully!', type: 'success' });
        } catch (error: any) {
            setToast({ message: error?.message || 'Failed to change password', type: 'error' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
    const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

    return (
        <DashboardLayout>
            <div style={{ backgroundColor: theme.bg.app, minHeight: '100vh' }}>
                {/* Toast */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {/* Header */}
                <div style={{
                    backgroundColor: theme.bg.card,
                    borderBottom: `1px solid ${theme.border.primary}`,
                    padding: '20px 32px',
                }}>
                    <h1 style={{ fontSize: 22, fontWeight: 600, color: theme.text.primary, margin: 0 }}>
                        Settings
                    </h1>
                    <p style={{ fontSize: 13, color: theme.text.secondary, margin: '4px 0 0' }}>
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Content */}
                <div style={{ padding: 32, maxWidth: 800 }}>

                    {/* Profile Section */}
                    <SectionCard title="Profile Information" icon={<User size={20} />} theme={theme}>
                        {/* Avatar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                            <div
                                onClick={() => avatarInputRef.current?.click()}
                                style={{
                                    position: 'relative',
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    backgroundColor: theme.bg.hover,
                                    border: `2px solid ${theme.border.primary}`,
                                }}
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: theme.text.secondary,
                                        fontSize: 28,
                                        fontWeight: 600,
                                    }}>
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {avatarUploading && (
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Loader2 size={24} color="white" className="animate-spin" />
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    backgroundColor: theme.accent.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid white',
                                }}>
                                    <Camera size={14} color="white" />
                                </div>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    onChange={handleAvatarUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 500, color: theme.text.primary, margin: 0 }}>
                                    Profile Picture
                                </p>
                                <p style={{ fontSize: 12, color: theme.text.muted, margin: '4px 0 0' }}>
                                    JPG, PNG, GIF or WebP. Max 2MB.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FormInput
                                label="Full Name"
                                value={profileData.name}
                                onChange={(v) => setProfileData({ ...profileData, name: v })}
                                icon={<User size={16} />}
                                theme={theme}
                            />
                            <FormInput
                                label="Email"
                                value={user?.email || ''}
                                onChange={() => { }}
                                icon={<Mail size={16} />}
                                disabled
                                theme={theme}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FormSelect
                                label="Language"
                                value={profileData.language}
                                onChange={(v) => setProfileData({ ...profileData, language: v })}
                                options={LANGUAGES}
                                icon={<Globe size={16} />}
                                theme={theme}
                            />
                            <FormSelect
                                label="Timezone"
                                value={profileData.timezone}
                                onChange={(v) => setProfileData({ ...profileData, timezone: v })}
                                options={TIMEZONES}
                                icon={<Clock size={16} />}
                                theme={theme}
                            />
                        </div>

                        <SaveButton
                            onClick={handleSaveProfile}
                            loading={profileLoading}
                            disabled={!profileChanged}
                            theme={theme}
                        />
                    </SectionCard>

                    {/* Preferences Section */}
                    <SectionCard title="Account Preferences" icon={<DollarSign size={20} />} theme={theme}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FormSelect
                                label="Currency"
                                value={preferencesData.currency}
                                onChange={(v) => setPreferencesData({ ...preferencesData, currency: v })}
                                options={CURRENCIES}
                                icon={<DollarSign size={16} />}
                                theme={theme}
                            />
                            <FormSelect
                                label="Date Format"
                                value={preferencesData.date_format}
                                onChange={(v) => setPreferencesData({ ...preferencesData, date_format: v })}
                                options={DATE_FORMATS}
                                icon={<Calendar size={16} />}
                                theme={theme}
                            />
                        </div>

                        <div style={{ marginTop: 8 }}>
                            <Toggle
                                label="Email Notifications"
                                description="Receive updates about your account and orders"
                                checked={preferencesData.notifications_enabled}
                                onChange={(v) => setPreferencesData({ ...preferencesData, notifications_enabled: v })}
                                theme={theme}
                            />
                        </div>

                        <SaveButton
                            onClick={handleSavePreferences}
                            loading={preferencesLoading}
                            disabled={!preferencesChanged}
                            theme={theme}
                        />
                    </SectionCard>

                    {/* Security Section */}
                    <SectionCard title="Security" icon={<Lock size={20} />} theme={theme}>
                        <p style={{ fontSize: 13, color: theme.text.secondary, marginBottom: 16 }}>
                            Change your password to keep your account secure.
                        </p>

                        <FormInput
                            label="New Password"
                            value={passwordData.newPassword}
                            onChange={(v) => setPasswordData({ ...passwordData, newPassword: v })}
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            icon={<Lock size={16} />}
                            theme={theme}
                            rightIcon={showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            onRightIconClick={() => setShowNewPassword(!showNewPassword)}
                        />

                        <FormInput
                            label="Confirm New Password"
                            value={passwordData.confirmPassword}
                            onChange={(v) => setPasswordData({ ...passwordData, confirmPassword: v })}
                            type="password"
                            placeholder="Confirm new password"
                            icon={<Lock size={16} />}
                            theme={theme}
                        />

                        <button
                            onClick={handleChangePassword}
                            disabled={passwordLoading || !passwordData.newPassword || !passwordData.confirmPassword}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 20px',
                                backgroundColor: passwordData.newPassword && passwordData.confirmPassword
                                    ? '#EF4444'
                                    : theme.bg.hover,
                                color: passwordData.newPassword && passwordData.confirmPassword
                                    ? 'white'
                                    : theme.text.muted,
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: passwordLoading || !passwordData.newPassword ? 'not-allowed' : 'pointer',
                                marginTop: 16,
                            }}
                        >
                            {passwordLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                            {passwordLoading ? 'Changing...' : 'Change Password'}
                        </button>
                    </SectionCard>

                </div>
            </div>
        </DashboardLayout>
    );
};
