export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    image: string;
    category: string;

    // Stock
    stock: {
        total: number;
        on_hand: number;
        reserved: number; // In active orders
        available: number; // on_hand - reserved - damaged
        damaged: number;
    };

    // Status / Moving
    status: {
        warehouse: number;
        shipped: number; // Out for delivery
        delivered: number; // Completed
        returned: number;
        delivered_unsettled: number; // Delivered but payment pending
    };

    // Financials
    financials: {
        cost: number;
        price: number;
        shipping_cost: number;
        return_cost: number;
        currency: string;
    };

    // Ops
    shipping_company: string;
    last_restock: string; // ISO Date
}

export interface InventoryStats {
    total_products: number;
    total_stock_value: number; // Cost basis
    total_available_stock: number;
    active_orders_count: number; // Reserved units
    returned_units: number;
    net_realized_profit: number;
    low_stock_items: number;
}
