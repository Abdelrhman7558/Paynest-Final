// =====================================================
// ACCOUNTS PAYABLE SERVICE
// Handles all vendor, purchase, and payment operations
// =====================================================

import { supabase } from '../lib/supabaseClient';
import type {
    Vendor,
    VendorDetail,
    Product,
    PurchaseRecord,
    Shipment,
    VendorPayment,
    Attachment,
    APMetrics,
    TableColumn,
    TableConfig,
    CreateVendorInput,
    CreatePurchaseInput,
    UpdatePurchaseInput,
    RecordPaymentInput,
    CreateProductInput,
    DEFAULT_PAYABLES_COLUMNS,
    PurchaseStatus,
} from '../types/accountsPayable';

// Toggle for development - set to false when Supabase is ready
const USE_MOCK_DATA = true;

// =====================================================
// MOCK DATA
// =====================================================

const MOCK_VENDORS: Vendor[] = [
    { id: 'v1', workspace_id: 'ws1', name: 'ABC Trading Co.', contact_person: 'Mohamed Hassan', phone: '+20 123 456 789', email: 'mohamed@abctrading.com', address: '123 Industrial Area, Cairo', default_currency: 'EGP', payment_terms_days: 30, notes: 'Premium supplier', created_at: '2024-01-15', is_active: true },
    { id: 'v2', workspace_id: 'ws1', name: 'Global Imports Ltd', contact_person: 'Sarah Ahmed', phone: '+20 111 222 333', email: 'sarah@globalimports.com', address: '456 Trade Zone, Alexandria', default_currency: 'EGP', payment_terms_days: 45, created_at: '2024-02-10', is_active: true },
    { id: 'v3', workspace_id: 'ws1', name: 'Nile Supplies', contact_person: 'Ahmed Kamal', phone: '+20 100 200 300', email: 'ahmed@nilesupplies.com', address: '789 Business Park, Giza', default_currency: 'EGP', payment_terms_days: 15, created_at: '2024-03-05', is_active: true },
    { id: 'v4', workspace_id: 'ws1', name: 'Delta Electronics', contact_person: 'Laila Mostafa', phone: '+20 155 666 777', email: 'laila@deltaelec.com', address: '321 Tech Hub, Mansoura', default_currency: 'EGP', payment_terms_days: 30, created_at: '2024-01-22', is_active: true },
    { id: 'v5', workspace_id: 'ws1', name: 'Pharaoh Manufacturing', contact_person: 'Omar Farouk', phone: '+20 122 333 444', email: 'omar@pharaoh.com', address: '555 Factory Road, 10th of Ramadan', default_currency: 'EGP', payment_terms_days: 60, created_at: '2024-04-01', is_active: true },
];

const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', workspace_id: 'ws1', vendor_id: 'v1', name: 'Steel Sheets 2mm', unit_price: 850, currency: 'EGP', category: 'Raw Materials', created_at: '2024-01-20' },
    { id: 'p2', workspace_id: 'ws1', vendor_id: 'v1', name: 'Aluminum Bars 1.5m', unit_price: 1200, currency: 'EGP', category: 'Raw Materials', created_at: '2024-01-20' },
    { id: 'p3', workspace_id: 'ws1', vendor_id: 'v2', name: 'Office Supplies Pack', unit_price: 450, currency: 'EGP', category: 'Supplies', created_at: '2024-02-15' },
    { id: 'p4', workspace_id: 'ws1', vendor_id: 'v3', name: 'Cleaning Equipment Set', unit_price: 1800, currency: 'EGP', category: 'Equipment', created_at: '2024-03-10' },
    { id: 'p5', workspace_id: 'ws1', vendor_id: 'v4', name: 'LED Panel 60x60', unit_price: 650, currency: 'EGP', category: 'Electronics', created_at: '2024-02-01' },
];

const MOCK_PURCHASES: PurchaseRecord[] = [
    { id: 'pur1', workspace_id: 'ws1', vendor_id: 'v1', vendor_name: 'ABC Trading Co.', product_name: 'Steel Sheets 2mm', purchase_price: 850, quantity: 100, total_cost: 85000, paid_amount: 85000, outstanding_amount: 0, last_shipment_received: true, last_shipment_date: '2024-12-10', notes: 'Regular order', status: 'paid', currency: 'EGP', created_at: '2024-12-01' },
    { id: 'pur2', workspace_id: 'ws1', vendor_id: 'v1', vendor_name: 'ABC Trading Co.', product_name: 'Aluminum Bars 1.5m', purchase_price: 1200, quantity: 50, total_cost: 60000, paid_amount: 30000, outstanding_amount: 30000, last_shipment_received: true, last_shipment_date: '2024-12-20', status: 'partially_paid', currency: 'EGP', created_at: '2024-12-15' },
    { id: 'pur3', workspace_id: 'ws1', vendor_id: 'v2', vendor_name: 'Global Imports Ltd', product_name: 'Office Supplies Pack', purchase_price: 450, quantity: 200, total_cost: 90000, paid_amount: 0, outstanding_amount: 90000, last_shipment_received: false, status: 'unpaid', currency: 'EGP', created_at: '2024-12-25' },
    { id: 'pur4', workspace_id: 'ws1', vendor_id: 'v3', vendor_name: 'Nile Supplies', product_name: 'Cleaning Equipment Set', purchase_price: 1800, quantity: 20, total_cost: 36000, paid_amount: 36000, outstanding_amount: 0, last_shipment_received: true, last_shipment_date: '2024-11-28', status: 'paid', currency: 'EGP', created_at: '2024-11-20' },
    { id: 'pur5', workspace_id: 'ws1', vendor_id: 'v4', vendor_name: 'Delta Electronics', product_name: 'LED Panel 60x60', purchase_price: 650, quantity: 150, total_cost: 97500, paid_amount: 50000, outstanding_amount: 47500, last_shipment_received: true, last_shipment_date: '2025-01-05', status: 'partially_paid', currency: 'EGP', created_at: '2024-12-28' },
    { id: 'pur6', workspace_id: 'ws1', vendor_id: 'v5', vendor_name: 'Pharaoh Manufacturing', product_name: 'Industrial Machinery Parts', purchase_price: 5500, quantity: 10, total_cost: 55000, paid_amount: 55000, outstanding_amount: 0, last_shipment_received: true, last_shipment_date: '2025-01-10', status: 'paid', currency: 'EGP', created_at: '2025-01-02' },
    { id: 'pur7', workspace_id: 'ws1', vendor_id: 'v2', vendor_name: 'Global Imports Ltd', product_name: 'Packaging Materials', purchase_price: 320, quantity: 500, total_cost: 160000, paid_amount: 80000, outstanding_amount: 80000, last_shipment_received: true, last_shipment_date: '2025-01-15', status: 'partially_paid', currency: 'EGP', created_at: '2025-01-08' },
    { id: 'pur8', workspace_id: 'ws1', vendor_id: 'v3', vendor_name: 'Nile Supplies', product_name: 'Safety Equipment', purchase_price: 750, quantity: 40, total_cost: 30000, paid_amount: 0, outstanding_amount: 30000, last_shipment_received: false, status: 'unpaid', currency: 'EGP', created_at: '2025-01-20' },
];

const MOCK_PAYMENTS: VendorPayment[] = [
    { id: 'pay1', workspace_id: 'ws1', vendor_id: 'v1', purchase_id: 'pur1', payment_date: '2024-12-05', amount: 85000, currency: 'EGP', payment_method: 'bank_transfer', reference_number: 'TXN-001', created_at: '2024-12-05' },
    { id: 'pay2', workspace_id: 'ws1', vendor_id: 'v1', purchase_id: 'pur2', payment_date: '2024-12-18', amount: 30000, currency: 'EGP', payment_method: 'bank_transfer', reference_number: 'TXN-002', created_at: '2024-12-18' },
    { id: 'pay3', workspace_id: 'ws1', vendor_id: 'v3', purchase_id: 'pur4', payment_date: '2024-11-25', amount: 36000, currency: 'EGP', payment_method: 'check', reference_number: 'CHK-101', created_at: '2024-11-25' },
    { id: 'pay4', workspace_id: 'ws1', vendor_id: 'v4', purchase_id: 'pur5', payment_date: '2025-01-02', amount: 50000, currency: 'EGP', payment_method: 'bank_transfer', reference_number: 'TXN-003', created_at: '2025-01-02' },
    { id: 'pay5', workspace_id: 'ws1', vendor_id: 'v5', purchase_id: 'pur6', payment_date: '2025-01-05', amount: 55000, currency: 'EGP', payment_method: 'cash', created_at: '2025-01-05' },
    { id: 'pay6', workspace_id: 'ws1', vendor_id: 'v2', purchase_id: 'pur7', payment_date: '2025-01-12', amount: 80000, currency: 'EGP', payment_method: 'bank_transfer', reference_number: 'TXN-004', created_at: '2025-01-12' },
];

const MOCK_SHIPMENTS: Shipment[] = [
    { id: 'sh1', workspace_id: 'ws1', vendor_id: 'v1', purchase_id: 'pur1', shipment_date: '2024-12-08', received: true, received_date: '2024-12-10', tracking_number: 'TRK-001', created_at: '2024-12-08' },
    { id: 'sh2', workspace_id: 'ws1', vendor_id: 'v1', purchase_id: 'pur2', shipment_date: '2024-12-18', received: true, received_date: '2024-12-20', tracking_number: 'TRK-002', created_at: '2024-12-18' },
    { id: 'sh3', workspace_id: 'ws1', vendor_id: 'v3', purchase_id: 'pur4', shipment_date: '2024-11-25', received: true, received_date: '2024-11-28', created_at: '2024-11-25' },
    { id: 'sh4', workspace_id: 'ws1', vendor_id: 'v4', purchase_id: 'pur5', shipment_date: '2025-01-03', received: true, received_date: '2025-01-05', tracking_number: 'TRK-003', created_at: '2025-01-03' },
];

const MOCK_ATTACHMENTS: Attachment[] = [
    { id: 'att1', workspace_id: 'ws1', entity_type: 'vendor', entity_id: 'v1', file_name: 'vendor_contract.pdf', file_url: '/attachments/vendor_contract.pdf', file_type: 'application/pdf', file_size: 245000, created_at: '2024-01-15' },
    { id: 'att2', workspace_id: 'ws1', entity_type: 'product', entity_id: 'p1', file_name: 'steel_sheet_spec.pdf', file_url: '/attachments/steel_sheet_spec.pdf', file_type: 'application/pdf', file_size: 120000, created_at: '2024-01-20' },
];

// =====================================================
// API FUNCTIONS
// =====================================================

// Fetch AP Metrics (4 KPI Cards)
export const fetchAPMetrics = async (): Promise<APMetrics> => {
    if (USE_MOCK_DATA) {
        const totalPurchaseCost = MOCK_PURCHASES.reduce((sum, p) => sum + p.total_cost, 0);
        const totalPaid = MOCK_PURCHASES.reduce((sum, p) => sum + p.paid_amount, 0);
        const outstandingPayables = MOCK_PURCHASES.reduce((sum, p) => sum + p.outstanding_amount, 0);

        // Simulated revenue from goods (markup)
        const totalRevenueFromGoods = totalPurchaseCost * 1.35; // 35% markup
        const netGoodsProfit = totalRevenueFromGoods - totalPurchaseCost;

        return {
            totalPurchaseCost,
            totalRevenueFromGoods,
            outstandingPayables,
            netGoodsProfit,
            purchaseCostChange: 12.5,
            revenueChange: 18.3,
            outstandingChange: -8.2,
            profitChange: 22.1,
        };
    }

    // Supabase implementation would go here
    const { data, error } = await supabase.from('purchase_records').select('*');
    if (error) throw error;

    // Calculate metrics from data
    const totalPurchaseCost = data?.reduce((sum: number, p: any) => sum + (p.total_cost || 0), 0) || 0;
    const totalPaid = data?.reduce((sum: number, p: any) => sum + (p.paid_amount || 0), 0) || 0;
    const outstandingPayables = data?.reduce((sum: number, p: any) => sum + (p.outstanding_amount || 0), 0) || 0;
    const totalRevenueFromGoods = totalPurchaseCost * 1.35;
    const netGoodsProfit = totalRevenueFromGoods - totalPurchaseCost;

    return {
        totalPurchaseCost,
        totalRevenueFromGoods,
        outstandingPayables,
        netGoodsProfit,
        purchaseCostChange: 0,
        revenueChange: 0,
        outstandingChange: 0,
        profitChange: 0,
    };
};

// Fetch all purchases (main table data)
export const fetchPurchases = async (): Promise<PurchaseRecord[]> => {
    if (USE_MOCK_DATA) {
        return MOCK_PURCHASES;
    }

    const { data, error } = await supabase.from('purchase_records').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

// Create a new purchase record
export const createPurchase = async (input: CreatePurchaseInput): Promise<PurchaseRecord> => {
    const total_cost = input.purchase_price * input.quantity;
    const paid_amount = input.paid_amount || 0;
    const outstanding_amount = total_cost - paid_amount;
    const status: PurchaseStatus = paid_amount >= total_cost ? 'paid' : paid_amount > 0 ? 'partially_paid' : 'unpaid';

    const newPurchase: PurchaseRecord = {
        id: `pur_${Date.now()}`,
        workspace_id: 'ws1',
        vendor_id: input.vendor_id,
        vendor_name: input.vendor_name,
        product_name: input.product_name,
        purchase_price: input.purchase_price,
        quantity: input.quantity,
        total_cost,
        paid_amount,
        outstanding_amount,
        last_shipment_received: false,
        status,
        currency: input.currency || 'EGP',
        notes: input.notes,
        created_at: new Date().toISOString(),
    };

    if (USE_MOCK_DATA) {
        MOCK_PURCHASES.unshift(newPurchase);
        return newPurchase;
    }

    const { data, error } = await supabase.from('purchase_records').insert(newPurchase).select().single();
    if (error) throw error;
    return data;
};

// Update a purchase record
export const updatePurchase = async (id: string, input: UpdatePurchaseInput): Promise<PurchaseRecord> => {
    if (USE_MOCK_DATA) {
        const index = MOCK_PURCHASES.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Purchase not found');

        const purchase = MOCK_PURCHASES[index];
        const updated = { ...purchase, ...input, updated_at: new Date().toISOString() };

        // Recalculate auto fields
        if (input.purchase_price !== undefined || input.quantity !== undefined) {
            updated.total_cost = (input.purchase_price ?? purchase.purchase_price) * (input.quantity ?? purchase.quantity);
        }
        updated.outstanding_amount = updated.total_cost - updated.paid_amount;

        // Auto-update status
        if (updated.paid_amount >= updated.total_cost) {
            updated.status = 'paid';
        } else if (updated.paid_amount > 0) {
            updated.status = 'partially_paid';
        } else {
            updated.status = 'unpaid';
        }

        MOCK_PURCHASES[index] = updated;
        return updated;
    }

    const { data, error } = await supabase.from('purchase_records').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

// Delete purchase record
export const deletePurchase = async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
        const index = MOCK_PURCHASES.findIndex(p => p.id === id);
        if (index !== -1) MOCK_PURCHASES.splice(index, 1);
        return;
    }

    const { error } = await supabase.from('purchase_records').delete().eq('id', id);
    if (error) throw error;
};

// Fetch vendor details with all related data
export const fetchVendorDetail = async (vendorId: string): Promise<VendorDetail | null> => {
    if (USE_MOCK_DATA) {
        const vendor = MOCK_VENDORS.find(v => v.id === vendorId);
        if (!vendor) return null;

        const products = MOCK_PRODUCTS.filter(p => p.vendor_id === vendorId);
        const purchases = MOCK_PURCHASES.filter(p => p.vendor_id === vendorId);
        const payments = MOCK_PAYMENTS.filter(p => p.vendor_id === vendorId);
        const shipments = MOCK_SHIPMENTS.filter(s => s.vendor_id === vendorId);
        const attachments = MOCK_ATTACHMENTS.filter(a =>
            (a.entity_type === 'vendor' && a.entity_id === vendorId) ||
            products.some(p => a.entity_type === 'product' && a.entity_id === p.id)
        );

        const total_purchase_cost = purchases.reduce((sum, p) => sum + p.total_cost, 0);
        const total_paid = purchases.reduce((sum, p) => sum + p.paid_amount, 0);
        const total_outstanding = purchases.reduce((sum, p) => sum + p.outstanding_amount, 0);

        return {
            ...vendor,
            products,
            purchases,
            payments,
            shipments,
            attachments,
            total_purchase_cost,
            total_paid,
            total_outstanding,
        };
    }

    // Supabase implementation would fetch from multiple tables
    return null;
};

// Fetch all vendors
export const fetchVendors = async (): Promise<Vendor[]> => {
    if (USE_MOCK_DATA) {
        return MOCK_VENDORS;
    }

    const { data, error } = await supabase.from('vendors').select('*').eq('is_active', true);
    if (error) throw error;
    return data || [];
};

// Create vendor
export const createVendor = async (input: CreateVendorInput): Promise<Vendor> => {
    const newVendor: Vendor = {
        id: `v_${Date.now()}`,
        workspace_id: 'ws1',
        name: input.name,
        contact_person: input.contact_person,
        phone: input.phone,
        email: input.email,
        address: input.address,
        tax_number: input.tax_number,
        default_currency: input.default_currency || 'EGP',
        payment_terms_days: input.payment_terms_days || 30,
        notes: input.notes,
        created_at: new Date().toISOString(),
        is_active: true,
    };

    if (USE_MOCK_DATA) {
        MOCK_VENDORS.push(newVendor);
        return newVendor;
    }

    const { data, error } = await supabase.from('vendors').insert(newVendor).select().single();
    if (error) throw error;
    return data;
};

// Record payment
export const recordPayment = async (input: RecordPaymentInput): Promise<VendorPayment> => {
    const newPayment: VendorPayment = {
        id: `pay_${Date.now()}`,
        workspace_id: 'ws1',
        vendor_id: input.vendor_id,
        purchase_id: input.purchase_id,
        payment_date: input.payment_date,
        amount: input.amount,
        currency: input.currency || 'EGP',
        payment_method: input.payment_method,
        reference_number: input.reference_number,
        notes: input.notes,
        created_at: new Date().toISOString(),
    };

    if (USE_MOCK_DATA) {
        MOCK_PAYMENTS.push(newPayment);

        // Update purchase paid amount
        if (input.purchase_id) {
            const purchaseIndex = MOCK_PURCHASES.findIndex(p => p.id === input.purchase_id);
            if (purchaseIndex !== -1) {
                const purchase = MOCK_PURCHASES[purchaseIndex];
                purchase.paid_amount += input.amount;
                purchase.outstanding_amount = purchase.total_cost - purchase.paid_amount;
                purchase.status = purchase.paid_amount >= purchase.total_cost ? 'paid' : purchase.paid_amount > 0 ? 'partially_paid' : 'unpaid';
            }
        }

        return newPayment;
    }

    const { data, error } = await supabase.from('vendor_payments').insert(newPayment).select().single();
    if (error) throw error;
    return data;
};

// Create product
export const createProduct = async (input: CreateProductInput): Promise<Product> => {
    const newProduct: Product = {
        id: `p_${Date.now()}`,
        workspace_id: 'ws1',
        vendor_id: input.vendor_id,
        name: input.name,
        description: input.description,
        unit_price: input.unit_price,
        currency: input.currency || 'EGP',
        category: input.category,
        sku: input.sku,
        created_at: new Date().toISOString(),
    };

    if (USE_MOCK_DATA) {
        MOCK_PRODUCTS.push(newProduct);
        return newProduct;
    }

    const { data, error } = await supabase.from('products').insert(newProduct).select().single();
    if (error) throw error;
    return data;
};

// Fetch vendor payments
export const fetchVendorPayments = async (vendorId: string): Promise<VendorPayment[]> => {
    if (USE_MOCK_DATA) {
        return MOCK_PAYMENTS.filter(p => p.vendor_id === vendorId);
    }

    const { data, error } = await supabase.from('vendor_payments').select('*').eq('vendor_id', vendorId).order('payment_date', { ascending: false });
    if (error) throw error;
    return data || [];
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export const getStatusColor = (status: PurchaseStatus): { bg: string; text: string; darkBg: string } => {
    switch (status) {
        case 'paid':
            return { bg: '#DCFCE7', text: '#166534', darkBg: 'rgba(34, 197, 94, 0.2)' };
        case 'partially_paid':
            return { bg: '#FEF9C3', text: '#A16207', darkBg: 'rgba(234, 179, 8, 0.2)' };
        case 'unpaid':
            return { bg: '#FEE2E2', text: '#DC2626', darkBg: 'rgba(239, 68, 68, 0.2)' };
        default:
            return { bg: '#F3F4F6', text: '#6B7280', darkBg: 'rgba(107, 114, 128, 0.2)' };
    }
};

export const formatPaymentMethod = (method?: string): string => {
    if (!method) return '-';
    return method.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export const formatCurrencyValue = (value: number, currency: string = 'EGP'): string => {
    return new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};
