import React, { useState, useEffect, useRef } from 'react';
import { Bell, Trash2, MessageSquare, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    user_id: string;
    message: string;
    status: 'Sent' | 'User_view' | 'User_delete';
    created_at: string;
    type?: 'info' | 'success' | 'warning' | 'error'; // Extended schema support
    link?: string;
}

export const NotificationBell: React.FC = () => {
    const { user } = useAuth();
    const { theme, mode } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        if (!user) return;

        try {

            const { data, error } = await supabase
                .from('Notification')
                .select('*')
                .eq('user_id', user.id)
                .neq('status', 'User_delete')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setNotifications(data as Notification[]);
                setUnreadCount(data.filter(n => n.status === 'Sent').length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const subscription = supabase
            .channel('public:Notification')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'Notification',
                filter: `user_id=eq.${user?.id}`
            }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsViewed = async (id: string, currentStatus: string) => {
        if (currentStatus !== 'Sent') return;

        try {
            const { error } = await supabase
                .from('Notification')
                .update({ status: 'User_view' })
                .eq('id', id);

            if (error) throw error;

            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, status: 'User_view' } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));

        } catch (error) {
            console.error('Error updating notification:', error);
        }
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('Notification')
                .update({ status: 'User_delete' })
                .eq('id', id);

            if (error) throw error;

            setNotifications(prev => prev.filter(n => n.id !== id));
            const wasUnread = notifications.find(n => n.id === id)?.status === 'Sent';
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));

        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const markAllRead = async () => {
        try {
            const unreadIds = notifications.filter(n => n.status === 'Sent').map(n => n.id);
            if (unreadIds.length === 0) return;

            const { error } = await supabase
                .from('Notification')
                .update({ status: 'User_view' })
                .in('id', unreadIds);

            if (error) throw error;

            setNotifications(prev => prev.map(n => ({ ...n, status: 'User_view' })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all read:', error);
        }
    };

    const filteredNotifications = activeTab === 'unread'
        ? notifications.filter(n => n.status === 'Sent')
        : notifications;

    const getIcon = (type?: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'warning': return <AlertCircle size={16} className="text-amber-500" />;
            case 'error': return <AlertCircle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: `1px solid ${isOpen ? theme.accent.primary : theme.border.primary}`,
                    backgroundColor: isOpen ? (mode === 'Dark' ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF') : theme.bg.card,
                    color: isOpen ? theme.accent.primary : theme.text.secondary,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '10px',
                        height: '10px',
                        backgroundColor: theme.status.cost,
                        borderRadius: '50%',
                        border: `2px solid ${theme.bg.card}`
                    }} />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 12px)',
                            right: 0, // Align right to match standard header behavior
                            width: '360px',
                            maxHeight: '500px',
                            backgroundColor: theme.bg.card,
                            borderRadius: '16px',
                            boxShadow: mode === 'Dark' ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.12)',
                            border: `1px solid ${theme.border.primary}`,
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            transformOrigin: 'top right'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '16px', borderBottom: `1px solid ${theme.border.subtle}` }}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.text.primary, margin: 0 }}>Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        style={{ fontSize: '12px', color: theme.accent.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                {['all', 'unread'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        style={{
                                            flex: 1,
                                            padding: '6px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            backgroundColor: activeTab === tab ? theme.bg.card : 'transparent',
                                            color: activeTab === tab ? theme.text.primary : theme.text.secondary,
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                            transition: 'all 0.2s',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div style={{ overflowY: 'auto', flex: 1, maxHeight: '350px' }}>
                            {filteredNotifications.length === 0 ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.text.muted }}>
                                    <MessageSquare size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                    <p style={{ fontSize: '14px', margin: 0 }}>No notifications found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markAsViewed(notification.id, notification.status)}
                                            style={{
                                                padding: '16px',
                                                cursor: 'pointer',
                                                backgroundColor: notification.status === 'Sent' ? (mode === 'Dark' ? 'rgba(59, 130, 246, 0.1)' : '#F0F9FF') : 'transparent',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (notification.status !== 'Sent') e.currentTarget.style.backgroundColor = theme.bg.hover;
                                            }}
                                            onMouseLeave={(e) => {
                                                if (notification.status !== 'Sent') e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <div className="flex gap-3 items-start">
                                                <div style={{ marginTop: '2px' }}>
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p style={{
                                                        fontSize: '14px',
                                                        color: theme.text.primary,
                                                        fontWeight: notification.status === 'Sent' ? 600 : 400,
                                                        margin: '0 0 4px 0',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {notification.message}
                                                    </p>
                                                    <p style={{ fontSize: '11px', color: theme.text.muted, margin: 0 }}>
                                                        {new Date(notification.created_at).toLocaleDateString()} • {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => deleteNotification(notification.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
