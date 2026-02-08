import React, { useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '../components/dashboard/KPICard';
import { UsersTable } from '../components/dashboard/UsersTable';
import { Users, Server, Activity, ShieldCheck } from 'lucide-react';

const ALLOWED_EMAILS = ['7bd02025@gmail.com', 'jihadalcc@gmail.com'];

export const Manager: React.FC = () => {
    const { theme } = useTheme();

    // In a real app, we would check for admin role here
    // const { user } = useAuth();
    // if (user.role !== 'Manager') return <AccessDenied />;

    return (
        <DashboardLayout>
            <DashboardHeader
                onRefresh={() => { }}
                title="Manager Dashboard"
                subtitle="System administration and user management"
            />

            <div style={{ padding: '24px' }}>
                {/* System Health KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                    <KPICard
                        title="Total Users"
                        value={1250}
                        icon={<Users size={22} />}
                        iconBgColor="#DBEAFE"
                        iconBgColorDark="rgba(59, 130, 246, 0.2)"
                        iconColor="#3B82F6"
                        tooltip="Total registered users."
                    />
                    <KPICard
                        title="System Status"
                        value="Healthy"
                        icon={<Activity size={22} />}
                        iconBgColor="#DCFCE7"
                        iconBgColorDark="rgba(34, 197, 94, 0.2)"
                        iconColor="#22C55E"
                        tooltip="Current system operational status."
                    />
                    <KPICard
                        title="Server Uptime"
                        value="99.9%"
                        icon={<Server size={22} />}
                        iconBgColor="#F3F4F6"
                        iconBgColorDark="rgba(107, 114, 128, 0.2)"
                        iconColor="#4B5563"
                        tooltip="Server uptime percentage."
                        isPercentage
                    />
                    <KPICard
                        title="Security Alerts"
                        value={0}
                        icon={<ShieldCheck size={22} />}
                        iconBgColor="#EDE9FE"
                        iconBgColorDark="rgba(139, 92, 246, 0.2)"
                        iconColor="#8B5CF6"
                        tooltip="Active security alerts."
                    />
                </div>

                {/* Users Table */}
                <UsersTable />
            </div>
        </DashboardLayout>
    );
};
