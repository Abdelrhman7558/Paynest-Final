import React from 'react';
import { Shield, LogIn, LogOut, KeyRound, Smartphone, AlertTriangle, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SecurityEvent {
    id: string;
    type: 'login' | 'logout' | 'password_reset' | 'new_device' | 'failed_attempt';
    description: string;
    location: string;
    device: string;
    time: string;
    isAlert?: boolean;
}

const mockEvents: SecurityEvent[] = [
    { id: '1', type: 'login', description: 'Login from Chrome', location: 'Cairo, Egypt', device: 'Windows PC', time: 'Today at 10:42 AM' },
    { id: '2', type: 'new_device', description: 'New device login', location: 'Alexandria, Egypt', device: 'iPhone 15', time: 'Yesterday at 3:15 PM', isAlert: true },
    { id: '3', type: 'password_reset', description: 'Password changed', location: 'Cairo, Egypt', device: 'Windows PC', time: 'Jan 25, 2026' },
    { id: '4', type: 'logout', description: 'Logged out', location: 'Cairo, Egypt', device: 'Windows PC', time: 'Jan 24, 2026' },
    { id: '5', type: 'failed_attempt', description: 'Failed login attempt', location: 'Unknown', device: 'Unknown', time: 'Jan 23, 2026', isAlert: true },
];

const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
        case 'login': return <LogIn size={18} />;
        case 'logout': return <LogOut size={18} />;
        case 'password_reset': return <KeyRound size={18} />;
        case 'new_device': return <Smartphone size={18} />;
        case 'failed_attempt': return <AlertTriangle size={18} />;
        default: return <Shield size={18} />;
    }
};

const getEventColor = (type: SecurityEvent['type'], isAlert?: boolean) => {
    if (isAlert) return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' };
    switch (type) {
        case 'login': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' };
        case 'logout': return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748B' };
        case 'password_reset': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' };
        default: return { bg: 'rgba(15, 118, 110, 0.1)', color: '#0F766E' };
    }
};

export const SecurityActivity: React.FC = () => {
    const { dir } = useLanguage();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>Security activity</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Review recent security activity on your account.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <Shield size={14} />
                    Full activity visibility
                </div>
            </div>

            {/* Alert Banner (if any alerts) */}
            {mockEvents.some(e => e.isAlert) && (
                <div className="p-4 rounded-xl border flex items-center gap-4"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                        <AlertTriangle size={20} style={{ color: '#EF4444' }} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: '#EF4444' }}>
                            New login detected from an unfamiliar device.
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            If this wasn't you, secure your account immediately.
                        </p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-red-50"
                        style={{ borderColor: '#EF4444', color: '#EF4444' }}>
                        Secure account
                    </button>
                </div>
            )}

            {/* Events List */}
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                {mockEvents.map((event, index) => {
                    const colors = getEventColor(event.type, event.isAlert);
                    return (
                        <div
                            key={event.id}
                            className={`flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 ${index !== mockEvents.length - 1 ? 'border-b' : ''}`}
                            style={{ borderColor: 'var(--color-border)' }}
                        >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: colors.bg, color: colors.color }}>
                                {getEventIcon(event.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                    {event.description}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                    {event.location} · {event.device}
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                    {event.time}
                                </p>
                            </div>
                            <ChevronRight size={16} style={{ color: 'var(--color-text-secondary)' }} className={dir === 'rtl' ? 'rotate-180' : ''} />
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 rounded-xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                    <KeyRound size={20} style={{ color: 'var(--color-primary)' }} className="mb-2" />
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Reset password</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Change your password</p>
                </button>
                <button className="p-4 rounded-xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                    <Smartphone size={20} style={{ color: 'var(--color-primary)' }} className="mb-2" />
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Manage devices</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>View active sessions</p>
                </button>
                <button className="p-4 rounded-xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                    <Shield size={20} style={{ color: 'var(--color-primary)' }} className="mb-2" />
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Enable 2FA</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Add extra security</p>
                </button>
            </div>

            {/* Footer */}
            <div className="text-center pt-4">
                <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                    Powered by Supabase Auth · Encrypted authentication · Full activity visibility
                </p>
            </div>
        </div>
    );
};
