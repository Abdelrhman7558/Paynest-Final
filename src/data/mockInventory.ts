import type { InventoryItem, InventoryStats } from '../types/inventory';

export const mockInventoryStats: InventoryStats = {
    total_products: 142,
    total_stock_value: 452000, // EGP
    total_available_stock: 3240,
    active_orders_count: 145,
    returned_units: 32,
    net_realized_profit: 125000,
    low_stock_items: 2,
};

export const mockInventoryData: InventoryItem[] = [
    {
        id: 'prod_001',
        sku: 'NK-SHO-001',
        name: 'Nike Air Zoom Pegasus 39',
        image: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/e627448d-b040-4c4f-b67f-85d68d198533/air-zoom-pegasus-39-mens-road-running-shoes-d4dvtm.png',
        category: 'Footwear',
        stock: {
            total: 150,
            on_hand: 150,
            reserved: 12,
            available: 135, // 150 - 12 - 3
            damaged: 3
        },
        status: {
            warehouse: 138,
            shipped: 12,
            delivered: 450,
            returned: 15,
            delivered_unsettled: 45
        },
        financials: {
            cost: 2200,
            price: 4500,
            shipping_cost: 50,
            return_cost: 70,
            currency: 'EGP'
        },
        shipping_company: 'Bosta',
        last_restock: '2025-12-15'
    },
    {
        id: 'prod_002',
        sku: 'AD-TSH-002',
        name: 'Adidas Essentials T-Shirt',
        image: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/a084594380964147b184ad2d00a12e87_9366/Essentials_Single_Jersey_Embroidered_Small_Logo_Tee_White_GK9639_21_model.jpg',
        category: 'Apparel',
        stock: {
            total: 500,
            on_hand: 500,
            reserved: 45,
            available: 455,
            damaged: 0
        },
        status: {
            warehouse: 455,
            shipped: 20,
            delivered: 1200,
            returned: 5,
            delivered_unsettled: 12
        },
        financials: {
            cost: 350,
            price: 850,
            shipping_cost: 40,
            return_cost: 50,
            currency: 'EGP'
        },
        shipping_company: 'Aramex',
        last_restock: '2026-01-10'
    },
    {
        id: 'prod_003',
        sku: 'AP-WTC-003',
        name: 'Apple Watch Series 9',
        image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-card-40-s9-202309?wid=340&hei=264&fmt=p-jpg&qlt=95&.v=1692601248437',
        category: 'Electronics',
        stock: {
            total: 50,
            on_hand: 50,
            reserved: 5,
            available: 45,
            damaged: 0
        },
        status: {
            warehouse: 45,
            shipped: 3,
            delivered: 120,
            returned: 2,
            delivered_unsettled: 8
        },
        financials: {
            cost: 15000,
            price: 19500,
            shipping_cost: 100,
            return_cost: 150,
            currency: 'EGP'
        },
        shipping_company: 'Mylerz',
        last_restock: '2025-11-20'
    },
    {
        id: 'prod_004',
        sku: 'GEN-ACC-004',
        name: 'Leather Wallet - Brown',
        image: 'https://m.media-amazon.com/images/I/71u9t2b4qWL._AC_UY1000_.jpg',
        category: 'Accessories',
        stock: {
            total: 200,
            on_hand: 200,
            reserved: 0,
            available: 20, // Low stock scenario
            damaged: 5
        },
        status: {
            warehouse: 20,
            shipped: 0,
            delivered: 850,
            returned: 12,
            delivered_unsettled: 0
        },
        financials: {
            cost: 150,
            price: 450,
            shipping_cost: 40,
            return_cost: 50,
            currency: 'EGP'
        },
        shipping_company: 'Bosta',
        last_restock: '2025-08-01'
    },
    {
        id: 'prod_005',
        sku: 'HM-DEC-005',
        name: 'Ceramic Vase Set',
        image: 'https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_UF894,1000_QL80_.jpg',
        category: 'Home & Decor',
        stock: {
            total: 0,
            on_hand: 0,
            reserved: 0,
            available: 0, // Out of stock
            damaged: 2
        },
        status: {
            warehouse: 0,
            shipped: 0,
            delivered: 45,
            returned: 8, // High return rate
            delivered_unsettled: 0
        },
        financials: {
            cost: 600,
            price: 1200,
            shipping_cost: 80,
            return_cost: 120, // Fragile item
            currency: 'EGP'
        },
        shipping_company: 'Aramex',
        last_restock: '2025-01-05'
    }
];

// Helper to calculate profit on the fly
export const getUnitProfit = (item: InventoryItem) => {
    return item.financials.price - item.financials.cost - item.financials.shipping_cost - item.financials.return_cost;
};

export const getTotalProfit = (item: InventoryItem) => {
    return getUnitProfit(item) * item.status.delivered;
};
