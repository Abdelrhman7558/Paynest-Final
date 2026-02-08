import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Check, X, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => string;
    removeToast: (id: string) => void;
    updateToast: (id: string, updates: Partial<Toast>) => void;
    // Convenience methods
    success: (title: string, message?: string) => string;
    error: (title: string, message?: string) => string;
    warning: (title: string, message?: string) => string;
    info: (title: string, message?: string) => string;
    loading: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
        const id = generateId();
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration ?? (toast.type === 'loading' ? 0 : 5000),
        };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove after duration (unless loading or duration is 0)
        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, newToast.duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
        setToasts(prev => prev.map(t =>
            t.id === id ? { ...t, ...updates } : t
        ));

        // If updating to a non-loading type, auto-remove after duration
        if (updates.type && updates.type !== 'loading') {
            const duration = updates.duration ?? 5000;
            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }
        }
    }, [removeToast]);

    // Convenience methods
    const success = useCallback((title: string, message?: string) =>
        addToast({ type: 'success', title, message }), [addToast]);

    const error = useCallback((title: string, message?: string) =>
        addToast({ type: 'error', title, message, duration: 7000 }), [addToast]);

    const warning = useCallback((title: string, message?: string) =>
        addToast({ type: 'warning', title, message }), [addToast]);

    const info = useCallback((title: string, message?: string) =>
        addToast({ type: 'info', title, message }), [addToast]);

    const loading = useCallback((title: string, message?: string) =>
        addToast({ type: 'loading', title, message, duration: 0 }), [addToast]);

    return (
        <ToastContext.Provider value={{
            toasts,
            addToast,
            removeToast,
            updateToast,
            success,
            error,
            warning,
            info,
            loading,
        }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

// Toast Container Component
interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '400px',
                width: '100%',
            }}
        >
            {toasts.map((toast, index) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={() => onRemove(toast.id)}
                    index={index}
                />
            ))}
        </div>
    );
};

// Individual Toast Component
interface ToastItemProps {
    toast: Toast;
    onRemove: () => void;
    index: number;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove, index }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(onRemove, 200);
    };

    const config = {
        success: {
            icon: Check,
            bgColor: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
            iconBg: 'rgba(255, 255, 255, 0.2)',
        },
        error: {
            icon: AlertCircle,
            bgColor: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            iconBg: 'rgba(255, 255, 255, 0.2)',
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            iconBg: 'rgba(255, 255, 255, 0.2)',
        },
        info: {
            icon: Info,
            bgColor: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            iconBg: 'rgba(255, 255, 255, 0.2)',
        },
        loading: {
            icon: Loader2,
            bgColor: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            iconBg: 'rgba(255, 255, 255, 0.2)',
        },
    };

    const c = config[toast.type];
    const Icon = c.icon;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '16px 18px',
                background: c.bgColor,
                borderRadius: '14px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
                color: '#FFFFFF',
                animation: isExiting
                    ? 'toastSlideOut 0.2s ease-in forwards'
                    : `toastSlideIn 0.3s ease-out ${index * 50}ms both`,
            }}
        >
            {/* Icon */}
            <div
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: c.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <Icon
                    size={20}
                    color="#FFFFFF"
                    style={{
                        animation: toast.type === 'loading' ? 'spin 1s linear infinite' : 'none',
                    }}
                />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    margin: 0,
                    lineHeight: 1.4,
                }}>
                    {toast.title}
                </p>
                {toast.message && (
                    <p style={{
                        fontSize: '13px',
                        opacity: 0.9,
                        margin: '4px 0 0',
                        lineHeight: 1.4,
                    }}>
                        {toast.message}
                    </p>
                )}
                {toast.action && (
                    <button
                        onClick={toast.action.onClick}
                        style={{
                            marginTop: '10px',
                            padding: '6px 14px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            {/* Close Button */}
            {toast.type !== 'loading' && (
                <button
                    onClick={handleRemove}
                    style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                >
                    <X size={16} color="#FFFFFF" />
                </button>
            )}

            {/* CSS Keyframes */}
            <style>{`
                @keyframes toastSlideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes toastSlideOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ToastProvider;
