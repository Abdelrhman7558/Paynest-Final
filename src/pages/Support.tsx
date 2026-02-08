import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { useUpload } from '../context/UploadContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Headphones, BookOpen, Activity, ExternalLink,
    Upload, FileSpreadsheet, Trash2, AlertTriangle,
    Loader2, CheckCircle, Clock, XCircle,
    ShoppingCart, Database, Users, Megaphone, TrendingUp,
    HelpCircle
} from 'lucide-react';

// ================== TYPES ==================

interface UploadedSheet {
    id: string;
    user_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    category: 'orders' | 'inventory' | 'customers' | 'ads' | 'insights';
    uploaded_at: string;
    status: 'processing' | 'completed' | 'failed';
    error_message?: string;
}

// ================== SAMPLE DATA ==================

const sampleUploadedSheets: UploadedSheet[] = [
    {
        id: '1',
        user_id: 'user-1',
        file_name: 'orders_january_2026.csv',
        file_size: 245000,
        file_type: 'csv',
        category: 'orders',
        uploaded_at: '2026-02-05T10:30:00Z',
        status: 'completed',
    },
    {
        id: '2',
        user_id: 'user-1',
        file_name: 'inventory_snapshot.xlsx',
        file_size: 512000,
        file_type: 'xlsx',
        category: 'inventory',
        uploaded_at: '2026-02-04T14:15:00Z',
        status: 'completed',
    },
    {
        id: '3',
        user_id: 'user-1',
        file_name: 'customer_list.csv',
        file_size: 128000,
        file_type: 'csv',
        category: 'customers',
        uploaded_at: '2026-02-03T09:45:00Z',
        status: 'processing',
    },
];

// ================== HELPER FUNCTIONS ==================

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getCategoryIcon = (category: UploadedSheet['category']) => {
    switch (category) {
        case 'orders': return <ShoppingCart size={16} />;
        case 'inventory': return <Database size={16} />;
        case 'customers': return <Users size={16} />;
        case 'ads': return <Megaphone size={16} />;
        case 'insights': return <TrendingUp size={16} />;
    }
};

const getCategoryLabel = (category: UploadedSheet['category']) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
};

const getStatusBadge = (status: UploadedSheet['status'], _theme: any) => {
    const styles: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
        completed: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', icon: <CheckCircle size={14} /> },
        processing: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', icon: <Clock size={14} /> },
        failed: { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', icon: <XCircle size={14} /> },
    };
    const s = styles[status];
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 6,
            backgroundColor: s.bg,
            color: s.color,
            fontSize: 12,
            fontWeight: 500,
        }}>
            {s.icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

// ================== SUPPORT ACTION CARD ==================

const SupportActionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    theme: any;
    accentColor?: string;
}> = ({ icon, title, description, actionLabel, onAction, theme, accentColor = theme.accent.primary }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            style={{
                backgroundColor: theme.bg.card,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            }}
        >
            <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: `${accentColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor,
            }}>
                {icon}
            </div>
            <div>
                <h3 style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: theme.text.primary,
                    margin: '0 0 6px',
                }}>{title}</h3>
                <p style={{
                    fontSize: 13,
                    color: theme.text.secondary,
                    margin: 0,
                    lineHeight: 1.5,
                }}>{description}</p>
            </div>
            <button
                onClick={onAction}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: `1px solid ${theme.border.primary}`,
                    backgroundColor: 'transparent',
                    color: theme.text.primary,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginTop: 'auto',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bg.hover;
                    e.currentTarget.style.borderColor = accentColor;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = theme.border.primary;
                }}
            >
                {actionLabel}
                <ExternalLink size={14} />
            </button>
        </motion.div>
    );
};

// ================== SYSTEM STATUS CARD ==================

const SystemStatusCard: React.FC<{ theme: any }> = ({ theme }) => {
    const isOnline = true; // In production, fetch from API

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            style={{
                backgroundColor: theme.bg.card,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            }}
        >
            <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isOnline ? '#10B981' : '#F59E0B',
            }}>
                <Activity size={24} />
            </div>
            <div>
                <h3 style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: theme.text.primary,
                    margin: '0 0 6px',
                }}>System Status</h3>
                <p style={{
                    fontSize: 13,
                    color: theme.text.secondary,
                    margin: 0,
                    lineHeight: 1.5,
                }}>Platform health & updates</p>
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                borderRadius: 10,
                backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                marginTop: 'auto',
            }}>
                <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: isOnline ? '#10B981' : '#F59E0B',
                    animation: 'pulse 2s infinite',
                }} />
                <span style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: isOnline ? '#10B981' : '#F59E0B',
                }}>
                    {isOnline ? 'All Systems Operational' : 'Scheduled Maintenance'}
                </span>
            </div>
        </motion.div>
    );
};

// ================== DELETE CONFIRMATION MODAL ==================

const DeleteConfirmModal: React.FC<{
    isOpen: boolean;
    fileName: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
    theme: any;
}> = ({ isOpen, fileName, onConfirm, onCancel, isDeleting, theme }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                    backgroundColor: theme.bg.card,
                    borderRadius: 16,
                    padding: 24,
                    width: '100%',
                    maxWidth: 400,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                }}
            >
                <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                }}>
                    <AlertTriangle size={28} color="#EF4444" />
                </div>

                <h3 style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: theme.text.primary,
                    textAlign: 'center',
                    margin: '0 0 8px',
                }}>Delete Uploaded File?</h3>

                <p style={{
                    fontSize: 14,
                    color: theme.text.secondary,
                    textAlign: 'center',
                    margin: '0 0 24px',
                    lineHeight: 1.5,
                }}>
                    This will permanently delete <strong style={{ color: theme.text.primary }}>{fileName}</strong> and all associated data. This action cannot be undone.
                </p>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        style={{
                            flex: 1,
                            padding: '12px 20px',
                            borderRadius: 10,
                            border: `1px solid ${theme.border.primary}`,
                            backgroundColor: 'transparent',
                            color: theme.text.primary,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            opacity: isDeleting ? 0.5 : 1,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: '12px 20px',
                            borderRadius: 10,
                            border: 'none',
                            backgroundColor: '#EF4444',
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            opacity: isDeleting ? 0.7 : 1,
                        }}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Delete File
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ================== UPLOADED SHEETS TABLE ==================

const UploadedSheetsTable: React.FC<{
    sheets: UploadedSheet[];
    onDelete: (sheet: UploadedSheet) => void;
    theme: any;
}> = ({ sheets, onDelete, theme }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                backgroundColor: theme.bg.card,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: 16,
                overflow: 'hidden',
            }}
        >
            {/* Section Header */}
            <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${theme.border.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: `${theme.accent.primary}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.accent.primary,
                    }}>
                        <FileSpreadsheet size={20} />
                    </div>
                    <div>
                        <h3 style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: theme.text.primary,
                            margin: 0,
                        }}>Uploaded Sheets</h3>
                        <p style={{
                            fontSize: 12,
                            color: theme.text.muted,
                            margin: '2px 0 0',
                        }}>All files you have uploaded to the platform</p>
                    </div>
                </div>
                <span style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    backgroundColor: theme.bg.hover,
                    fontSize: 12,
                    fontWeight: 500,
                    color: theme.text.secondary,
                }}>
                    {sheets.length} file{sheets.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: theme.bg.hover }}>
                            {['File Name', 'Size', 'Category', 'Type', 'Uploaded At', 'Status', 'Actions'].map((header) => (
                                <th key={header} style={{
                                    textAlign: 'left',
                                    padding: '12px 16px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: theme.text.muted,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sheets.map((sheet, index) => (
                            <tr
                                key={sheet.id}
                                style={{
                                    borderBottom: index < sheets.length - 1 ? `1px solid ${theme.border.subtle}` : 'none',
                                }}
                            >
                                <td style={{
                                    padding: '16px',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: theme.text.primary,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <FileSpreadsheet size={18} color={theme.accent.primary} />
                                        {sheet.file_name}
                                    </div>
                                </td>
                                <td style={{
                                    padding: '16px',
                                    fontSize: 13,
                                    color: theme.text.secondary,
                                }}>
                                    {formatFileSize(sheet.file_size)}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '4px 10px',
                                        borderRadius: 6,
                                        backgroundColor: theme.bg.hover,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: theme.text.secondary,
                                    }}>
                                        {getCategoryIcon(sheet.category)}
                                        {getCategoryLabel(sheet.category)}
                                    </span>
                                </td>
                                <td style={{
                                    padding: '16px',
                                    fontSize: 13,
                                    color: theme.text.secondary,
                                    textTransform: 'uppercase',
                                }}>
                                    {sheet.file_type}
                                </td>
                                <td style={{
                                    padding: '16px',
                                    fontSize: 13,
                                    color: theme.text.secondary,
                                    whiteSpace: 'nowrap',
                                }}>
                                    {formatDate(sheet.uploaded_at)}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    {getStatusBadge(sheet.status, theme)}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <button
                                        onClick={() => onDelete(sheet)}
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 8,
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: theme.text.muted,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                            e.currentTarget.style.color = '#EF4444';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = theme.text.muted;
                                        }}
                                        title="Delete file"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

// ================== MAIN SUPPORT PAGE ==================

export const Support: React.FC = () => {
    const { theme } = useTheme();
    const { openUpload } = useUpload();

    // State
    const [uploadedSheets, setUploadedSheets] = useState<UploadedSheet[]>(sampleUploadedSheets);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; sheet: UploadedSheet | null }>({
        isOpen: false,
        sheet: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    // Delete handler
    const handleDeleteConfirm = async () => {
        if (!deleteModal.sheet) return;

        setIsDeleting(true);
        try {
            // In production: await supabase.from('uploaded_sheets').delete().eq('id', deleteModal.sheet.id);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API

            setUploadedSheets(prev => prev.filter(s => s.id !== deleteModal.sheet!.id));
            setDeleteModal({ isOpen: false, sheet: null });
        } catch (error) {
            console.error('Failed to delete:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <DashboardLayout>
            <div style={{
                backgroundColor: theme.bg.app,
                minHeight: '100vh',
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: theme.bg.card,
                    borderBottom: `1px solid ${theme.border.primary}`,
                    padding: '24px 32px',
                }}>
                    <h1 style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: theme.text.primary,
                        margin: 0,
                    }}>
                        Support Center
                    </h1>
                    <p style={{
                        fontSize: 14,
                        color: theme.text.secondary,
                        margin: '6px 0 0',
                    }}>
                        Get help, track your uploads, and manage your data
                    </p>
                </div>

                {/* Content */}
                <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>

                    {/* Support Actions Section */}
                    <section>
                        <h2 style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: theme.text.muted,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            margin: '0 0 16px',
                        }}>
                            How can we help?
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 20,
                        }}>
                            <SupportActionCard
                                icon={<Headphones size={24} />}
                                title="Contact Support"
                                description="Reach our support team for assistance with your account or technical issues."
                                actionLabel="Open Ticket"
                                onAction={() => window.open('mailto:support@masareefy.com', '_blank')}
                                theme={theme}
                                accentColor="#3B82F6"
                            />
                            <SupportActionCard
                                icon={<BookOpen size={24} />}
                                title="Help & Documentation"
                                description="Learn how the system works with our comprehensive guides and tutorials."
                                actionLabel="View Docs"
                                onAction={() => window.open('/docs', '_blank')}
                                theme={theme}
                                accentColor="#8B5CF6"
                            />
                            <SystemStatusCard theme={theme} />
                        </div>
                    </section>

                    {/* Quick Action: Upload */}
                    <section>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={openUpload}
                            style={{
                                backgroundColor: theme.bg.card,
                                border: `2px dashed ${theme.border.primary}`,
                                borderRadius: 16,
                                padding: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 16,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            whileHover={{
                                borderColor: theme.accent.primary,
                                backgroundColor: `${theme.accent.primary}05`,
                            }}
                        >
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                backgroundColor: `${theme.accent.primary}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: theme.accent.primary,
                            }}>
                                <Upload size={24} />
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: theme.text.primary,
                                    margin: 0,
                                }}>
                                    Upload Data Sheet
                                </h3>
                                <p style={{
                                    fontSize: 13,
                                    color: theme.text.secondary,
                                    margin: '4px 0 0',
                                }}>
                                    Import orders, inventory, customers, or ads data
                                </p>
                            </div>
                        </motion.div>
                    </section>

                    {/* Uploaded Sheets Section - Conditional */}
                    <AnimatePresence>
                        {uploadedSheets.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <UploadedSheetsTable
                                    sheets={uploadedSheets}
                                    onDelete={(sheet) => setDeleteModal({ isOpen: true, sheet })}
                                    theme={theme}
                                />
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {/* FAQ Section */}
                    <section>
                        <h2 style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: theme.text.muted,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            margin: '0 0 16px',
                        }}>
                            Frequently Asked Questions
                        </h2>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                backgroundColor: theme.bg.card,
                                border: `1px solid ${theme.border.primary}`,
                                borderRadius: 16,
                                overflow: 'hidden',
                            }}
                        >
                            {[
                                { q: 'What file formats are supported?', a: 'We support CSV, XLSX, and XLS files up to 10MB.' },
                                { q: 'How long does data processing take?', a: 'Most files are processed within minutes. Large files may take longer.' },
                                { q: 'Can I delete uploaded data?', a: 'Yes, you can delete any uploaded file. This will remove all associated data.' },
                            ].map((faq, index, arr) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '16px 20px',
                                        borderBottom: index < arr.length - 1 ? `1px solid ${theme.border.subtle}` : 'none',
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 12,
                                    }}>
                                        <HelpCircle size={18} color={theme.accent.primary} style={{ marginTop: 2 }} />
                                        <div>
                                            <p style={{
                                                fontSize: 14,
                                                fontWeight: 500,
                                                color: theme.text.primary,
                                                margin: '0 0 6px',
                                            }}>{faq.q}</p>
                                            <p style={{
                                                fontSize: 13,
                                                color: theme.text.secondary,
                                                margin: 0,
                                                lineHeight: 1.5,
                                            }}>{faq.a}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </section>

                </div>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    <DeleteConfirmModal
                        isOpen={deleteModal.isOpen}
                        fileName={deleteModal.sheet?.file_name || ''}
                        onConfirm={handleDeleteConfirm}
                        onCancel={() => setDeleteModal({ isOpen: false, sheet: null })}
                        isDeleting={isDeleting}
                        theme={theme}
                    />
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};
