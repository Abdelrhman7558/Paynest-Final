export const generateMockData = () => {
    // Mock Orders
    const mockOrders = Array.from({ length: 15 }).map((_, i) => ({
        id: `ORDER-${1000 + i}`,
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        total_price: Math.floor(Math.random() * 5000) + 500,
        status: Math.random() > 0.2 ? 'delivered' : 'pending',
        customer: {
            first_name: ['Ahmed', 'Mohamed', 'Sara', 'Nour'][Math.floor(Math.random() * 4)],
            last_name: ['Ali', 'Ibrahim', 'Hassan', 'Saad'][Math.floor(Math.random() * 4)],
            email: `customer${i}@example.com`
        }
    }));

    // Mock Inventory
    const mockInventory = Array.from({ length: 10 }).map((_, i) => ({
        id: `PROD-${i}`,
        title: `Product ${i + 1}`,
        sku: `SKU-${100 + i}`,
        inventory_quantity: Math.floor(Math.random() * 100),
        price: Math.floor(Math.random() * 1000) + 100
    }));

    // Mock Ads
    const mockAds = Array.from({ length: 5 }).map((_, i) => ({
        campaign_name: `Campaign ${['Summer', 'Winter', 'Flash Sale'][Math.floor(Math.random() * 3)]} ${i}`,
        spend: Math.floor(Math.random() * 2000) + 500,
        impressions: Math.floor(Math.random() * 10000) + 1000,
        clicks: Math.floor(Math.random() * 500) + 50,
        platform: Math.random() > 0.5 ? 'facebook' : 'google'
    }));

    // Mock Customers
    const mockCustomers = Array.from({ length: 20 }).map((_, i) => ({
        id: `CUST-${i}`,
        first_name: 'Mock',
        last_name: `User ${i}`,
        total_spent: Math.floor(Math.random() * 10000)
    }));

    return {
        orders: mockOrders,
        inventory: mockInventory,
        ads: mockAds,
        customers: mockCustomers,
        costs: []
    };
};

export const getMockDrillDownData = (metricId: string) => {
    const history = Array.from({ length: 30 }).map((_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.floor(Math.random() * 5000) + 1000
    }));

    const common = {
        sources: ['Shopify Orders', 'Meta Ads', 'Inventory DB'],
        history,
        aiInsight: {
            type: 'success' as const,
            text: 'Revenue is trending up 12% this week driven by higher conversion rates on Meta campaigns.'
        }
    };

    switch (metricId) {
        case 'revenue':
            return {
                metricId: 'Total Revenue',
                explanation: 'The total income generated from all sales channels before any deductions.',
                formula: 'Sum(Order Total) - Refunds',
                breakdown: [
                    { label: 'Online Store', value: 45000, percentage: 65 },
                    { label: 'Social Commerce', value: 15000, percentage: 25 },
                    { label: 'Marketplace', value: 8000, percentage: 10 },
                ],
                ...common
            };
        case 'profit':
            return {
                metricId: 'Net Profit',
                explanation: 'The actual profit remaining after deducting all costs (COGS, Ads, Shipping, Taxes).',
                formula: 'Revenue - (COGS + Ad Spend + Shipping + Taxes)',
                breakdown: [
                    { label: 'Gross Profit', value: 30000, percentage: 100 },
                    { label: 'Ad Spend', value: -5000, percentage: 16 },
                    { label: 'Shipping', value: -2000, percentage: 6 },
                ],
                ...common
            };
        default:
            return {
                metricId: 'Metric Analysis',
                explanation: 'Detailed breakdown of this performance metric.',
                formula: 'Calculated based on aggregated daily values.',
                breakdown: [
                    { label: 'Primary Source', value: 1200, percentage: 60 },
                    { label: 'Secondary Source', value: 800, percentage: 40 },
                ],
                ...common
            };
    }
};
