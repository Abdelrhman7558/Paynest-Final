import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import {
    Search,
    MoreHorizontal,
    Shield,
    UserX,
    Trash2,
    CheckCircle,
    XCircle,
    TrendingUp
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'User';
    status: 'Active' | 'Suspended' | 'Pending';
    joinedDate: string;
    revenue: number;
    growth: number;
    lastActive: string;
}

const MOCK_USERS: User[] = [
    {
        id: '1',
        name: 'Ahmed Manager',
        email: 'ahmed@masareefy.com',
        role: 'Manager',
        status: 'Active',
        joinedDate: '2023-01-15',
        revenue: 125000,
        growth: 15.4,
        lastActive: '2 mins ago'
    },
    {
        id: '2',
        name: 'Sarah Seller',
        email: 'sarah@store.com',
        role: 'User',
        status: 'Active',
        joinedDate: '2023-03-10',
        revenue: 45000,
        growth: 5.2,
        lastActive: '1 hour ago'
    },
    {
        id: '3',
        name: 'Inactive User',
        email: 'test@test.com',
        role: 'User',
        status: 'Suspended',
        joinedDate: '2023-05-20',
        revenue: 0,
        growth: 0,
        lastActive: '30 days ago'
    }
];

export const UsersTable: React.FC = () => {
    const { theme, mode } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>(MOCK_USERS);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return { bg: '#DCFCE7', text: '#166534', icon: <CheckCircle size={14} /> };
            case 'Suspended': return { bg: '#FEE2E2', text: '#991B1B', icon: <XCircle size={14} /> };
            case 'Pending': return { bg: '#FEF3C7', text: '#B45309', icon: <MoreHorizontal size={14} /> }; // Typo fixed in rendering
            default: return { bg: '#F3F4F6', text: '#374151', icon: null };
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const handleToggleStatus = (id: string) => {
        setUsers(users.map(u =>
            u.id === id
                ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
                : u
        ));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                backgroundColor: theme.bg.card,
                borderRadius: '16px',
                padding: '24px',
                marginTop: '24px',
                border: `1px solid ${theme.border.primary}`,
                boxShadow: mode === 'Dark' ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
            }}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 style={{ color: theme.text.primary, fontSize: '18px', fontWeight: 600 }}>User Management</h3>
                <div style={{ position: 'relative' }}>
                    <Search size={18} color={theme.text.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 16px 10px 40px',
                            borderRadius: '12px',
                            border: `1px solid ${theme.border.primary}`,
                            backgroundColor: theme.bg.app,
                            color: theme.text.primary,
                            fontSize: '14px',
                            width: '260px',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                        <tr style={{ textAlign: 'left' }}>
                            {['User', 'Role', 'Status', 'Revenue', 'Growth', 'Joined', 'Actions'].map((header, i) => (
                                <th key={i} style={{
                                    padding: '16px',
                                    backgroundColor: theme.bg.hover,
                                    color: theme.text.secondary,
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    borderBottom: `1px solid ${theme.border.primary}`,
                                    borderTopLeftRadius: i === 0 ? '12px' : '0',
                                    borderBottomLeftRadius: i === 0 ? '12px' : '0',
                                    borderTopRightRadius: i === 6 ? '12px' : '0',
                                    borderBottomRightRadius: i === 6 ? '12px' : '0'
                                }}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const statusStyle = getStatusColor(user.status);
                            return (
                                <tr key={user.id} style={{ borderBottom: `1px solid ${theme.border.subtle}` }}>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.border.subtle}` }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ color: theme.text.primary, fontWeight: 500, margin: 0 }}>{user.name}</p>
                                                <p style={{ color: theme.text.secondary, fontSize: '12px', margin: 0 }}>{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.border.subtle}` }}>
                                        <div className="flex items-center gap-1">
                                            {user.role === 'Manager' && <Shield size={14} className="text-purple-500" />}
                                            <span style={{ color: theme.text.primary, fontSize: '14px' }}>{user.role}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.border.subtle}` }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            backgroundColor: statusStyle.bg,
                                            color: statusStyle.text,
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            width: 'fit-content'
                                        }}>
                                            {statusStyle.icon}
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', color: theme.text.primary, fontWeight: 600, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                        ${user.revenue.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.border.subtle}` }}>
                                        <span style={{ color: user.growth >= 0 ? '#166534' : '#991B1B', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 500 }}>
                                            <TrendingUp size={14} />
                                            {user.growth}%
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', color: theme.text.secondary, borderBottom: `1px solid ${theme.border.subtle}` }}>
                                        {user.joinedDate}
                                    </td>
                                    <td style={{ padding: '16px', borderBottom: `1px solid ${theme.border.subtle}` }}>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(user.id)}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-orange-600 transition-colors"
                                                title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                                            >
                                                <UserX size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600 transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};
