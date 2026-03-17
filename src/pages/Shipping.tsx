import React, { useState, useCallback } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';


import { KPICard } from '../components/dashboard/KPICard';
import { ShippingTable, type Shipment } from '../components/dashboard/ShippingTable';
import { Truck, ArchiveRestore, DollarSign, Clock } from 'lucide-react';

interface ShippingMetrics {
    activeShipments: number;
    deliveredThisMonth: number;
    returnedOrders: number;
    totalShippingCost: number;
    processingOrders: number;
}

export const Shipping: React.FC = () => {

    const [metrics, setMetrics] = useState<ShippingMetrics>({
        activeShipments: 0,
        deliveredThisMonth: 0,
        returnedOrders: 0,
        totalShippingCost: 0,
        processingOrders: 0,
    });

    // Convert status to lowercase safely
    const statusLower = (s: string) => s?.toLowerCase() || '';

    // Memoize calculateMetrics to prevent infinite loops
    const calculateMetrics = useCallback((data: Shipment[]) => {
        try {
            console.log('Calculating metrics for', data.length, 'shipments');

            const activeShipments = data.filter(s =>
                statusLower(s.status).includes('transit') ||
                statusLower(s.status).includes('shipped') ||
                statusLower(s.status).includes('processing') ||
                statusLower(s.status).includes('pending')
            ).length;

            const deliveredThisMonth = data.filter(s =>
                statusLower(s.status).includes('delivered') ||
                statusLower(s.status).includes('completed')
            ).length;

            const returnedOrders = data.filter(s =>
                statusLower(s.status).includes('returned') ||
                statusLower(s.status).includes('cancelled') ||
                statusLower(s.status).includes('failed')
            ).length;

            const processingOrders = data.filter(s =>
                statusLower(s.status).includes('processing')
            ).length;

            const totalShippingCost = data.reduce((sum, s) => {
                const cost = typeof s.shippingCost === 'number' ? s.shippingCost : parseFloat(String(s.shippingCost)) || 0;
                return sum + cost;
            }, 0);

            setMetrics({
                activeShipments,
                deliveredThisMonth,
                returnedOrders,
                totalShippingCost,
                processingOrders,
            });
        } catch (error) {
            console.error('Error calculating metrics:', error);
        }
    }, []);

    // Stable callback for child component
    const handleDataLoaded = useCallback((data: Shipment[]) => {
        calculateMetrics(data);
    }, [calculateMetrics]);

    return (
        <DashboardLayout>
            <DashboardHeader
                onRefresh={() => {
                    // Refresh logic is now inside ShippingTable, 
                    // ideally we would trigger it via ref or key change, 
                    // but for now a page reload or auto-refresh in table is fine.
                    // We can pass a refresh trigger to table if needed.
                    window.location.reload();
                }}
                title="Shipping & Logistics"
                subtitle="Monitor shipments, delivery status, and logistics profitability"
            />

            <div style={{ padding: '24px' }}>
                {/* KPI Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                    <KPICard
                        title="Active Shipments"
                        value={metrics.activeShipments}
                        icon={<Truck size={22} />}
                        iconBgColor="#DBEAFE"
                        iconBgColorDark="rgba(59, 130, 246, 0.2)"
                        iconColor="#3B82F6"
                        tooltip="Orders currently in transit, pending, or processing."
                    />
                    <KPICard
                        title="Processing"
                        value={metrics.processingOrders}
                        icon={<Clock size={22} />}
                        iconBgColor="#FEF9C3"
                        iconBgColorDark="rgba(234, 179, 8, 0.2)"
                        iconColor="#EAB308"
                        tooltip="Orders being processed and prepared for shipping."
                    />
                    <KPICard
                        title="Returned / Failed"
                        value={metrics.returnedOrders}
                        icon={<ArchiveRestore size={22} />}
                        iconBgColor="#FEE2E2"
                        iconBgColorDark="rgba(239, 68, 68, 0.2)"
                        iconColor="#EF4444"
                        tooltip="Orders returned or failed delivery."
                    />
                    <KPICard
                        title="Total Shipping Cost"
                        value={`EGP ${metrics.totalShippingCost.toFixed(2)}`}
                        icon={<DollarSign size={22} />}
                        iconBgColor="#FFF7ED"
                        iconBgColorDark="rgba(249, 115, 22, 0.2)"
                        iconColor="#F97316"
                        tooltip="Total shipping cost for all orders."
                    />
                </div>

                {/* Main Table */}
                <ShippingTable onDataLoaded={handleDataLoaded} />
            </div>
        </DashboardLayout>
    );
};
