// =====================================================
// ACCOUNTS PAYABLE TYPE DEFINITIONS
// Finance-Grade, Enterprise-level Types
// =====================================================

// Vendor Status for risk assessment
export type VendorStatus = 'healthy' | 'overdue' | 'risk';

// Invoice/Purchase Status
export type PurchaseStatus = 'paid' | 'partially_paid' | 'unpaid';

// Invoice Source
export type InvoiceSource = 'manual' | 'upload' | 'api';

// Payment Methods
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'other';

// Column Types for dynamic table
export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'select' | 'calculated';

// =====================================================
// CORE ENTITIES
// =====================================================

// Vendor Interface
export interface Vendor {
    id: string;
    workspace_id: string;
    name: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    tax_number?: string;
    default_currency: string;
    payment_terms_days: number;
    notes?: string;
    created_at: string;
    updated_at?: string;
    is_active: boolean;
}

// Product/Goods purchased from vendor
export interface Product {
    id: string;
    workspace_id: string;
    vendor_id: string;
    name: string;
    description?: string;
    unit_price: number;
    currency: string;
    category?: string;
    sku?: string;
    image_url?: string;
    created_at: string;
    updated_at?: string;
}

// Shipment/Delivery record
export interface Shipment {
    id: string;
    workspace_id: string;
    vendor_id: string;
    purchase_id: string;
    shipment_date: string;
    received: boolean;
    received_date?: string;
    tracking_number?: string;
    notes?: string;
    created_at: string;
}

// Purchase Record (main table row)
export interface PurchaseRecord {
    id: string;
    workspace_id: string;
    vendor_id: string;
    vendor_name: string;
    product_name: string;
    purchase_price: number;
    quantity: number;
    total_cost: number; // auto-calculated
    paid_amount: number;
    outstanding_amount: number; // auto-calculated
    last_shipment_received: boolean;
    last_shipment_date?: string;
    notes?: string;
    status: PurchaseStatus;
    currency: string;
    created_at: string;
    updated_at?: string;
    // Custom fields storage
    custom_fields?: Record<string, any>;
}

// Attachment/Document
export interface Attachment {
    id: string;
    workspace_id: string;
    entity_type: 'vendor' | 'product' | 'purchase' | 'shipment';
    entity_id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
    uploaded_by?: string;
    created_at: string;
}

// Vendor Payment
export interface VendorPayment {
    id: string;
    workspace_id: string;
    vendor_id: string;
    purchase_id?: string;
    payment_date: string;
    amount: number;
    currency: string;
    payment_method?: PaymentMethod;
    reference_number?: string;
    notes?: string;
    created_by?: string;
    created_at: string;
}

// =====================================================
// DISPLAY/AGGREGATED TYPES
// =====================================================

// Vendor with full details for modal
export interface VendorDetail extends Vendor {
    products: Product[];
    purchases: PurchaseRecord[];
    payments: VendorPayment[];
    shipments: Shipment[];
    attachments: Attachment[];
    total_purchase_cost: number;
    total_paid: number;
    total_outstanding: number;
}

// =====================================================
// KPI METRICS TYPES (4 Cards)
// =====================================================

export interface APMetrics {
    totalPurchaseCost: number;      // Total money spent on goods
    totalRevenueFromGoods: number;  // Revenue from sold inventory
    outstandingPayables: number;    // Money still owed to vendors
    netGoodsProfit: number;         // Revenue - Purchase Cost
    // Percentage changes
    purchaseCostChange: number;
    revenueChange: number;
    outstandingChange: number;
    profitChange: number;
}

// =====================================================
// TABLE CONFIGURATION TYPES
// =====================================================

export interface TableColumn {
    id: string;
    key: string;
    label: string;
    type: ColumnType;
    width?: number;
    isDefault: boolean;
    isVisible: boolean;
    isEditable: boolean;
    isCalculated: boolean;
    formula?: string; // For calculated columns
    options?: string[]; // For select type
    order: number;
}

export interface TableConfig {
    id: string;
    workspace_id: string;
    table_name: string;
    columns: TableColumn[];
    created_at: string;
    updated_at?: string;
}

// Default columns for payables table
export const DEFAULT_PAYABLES_COLUMNS: TableColumn[] = [
    { id: 'col_1', key: 'vendor_name', label: 'Vendor Name', type: 'text', isDefault: true, isVisible: true, isEditable: true, isCalculated: false, order: 1 },
    { id: 'col_2', key: 'product_name', label: 'Product / Goods Name', type: 'text', isDefault: true, isVisible: true, isEditable: true, isCalculated: false, order: 2 },
    { id: 'col_3', key: 'purchase_price', label: 'Purchase Price', type: 'currency', isDefault: true, isVisible: true, isEditable: true, isCalculated: false, order: 3 },
    { id: 'col_4', key: 'quantity', label: 'Quantity', type: 'number', isDefault: true, isVisible: true, isEditable: true, isCalculated: false, order: 4 },
    { id: 'col_5', key: 'total_cost', label: 'Total Cost', type: 'currency', isDefault: true, isVisible: true, isEditable: false, isCalculated: true, formula: 'purchase_price * quantity', order: 5 },
    { id: 'col_6', key: 'paid_amount', label: 'Paid Amount', type: 'currency', isDefault: true, isVisible: true, isEditable: true, isCalculated: false, order: 6 },
    { id: 'col_7', key: 'outstanding_amount', label: 'Outstanding Amount', type: 'currency', isDefault: true, isVisible: true, isEditable: false, isCalculated: true, formula: 'total_cost - paid_amount', order: 7 },
    { id: 'col_8', key: 'last_shipment_received', label: 'Last Shipment Received', type: 'boolean', isDefault: true, isVisible: true, isEditable: true, isCalculated: false, order: 8 },
    { id: 'col_9', key: 'last_shipment_date', label: 'Last Shipment Date', type: 'date', isDefault: true, isVisible: true, isEditable: true, isCalculated: false, order: 9 },
    { id: 'col_10', key: 'notes', label: 'Notes', type: 'text', isDefault: true, isVisible: true, isEditable: true, isCalculated: false, order: 10 },
    { id: 'col_11', key: 'status', label: 'Status', type: 'select', options: ['Paid', 'Partially Paid', 'Unpaid'], isDefault: true, isVisible: true, isEditable: true, isCalculated: false, order: 11 },
];

// =====================================================
// FORM INPUT TYPES
// =====================================================

export interface CreateVendorInput {
    name: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    tax_number?: string;
    default_currency?: string;
    payment_terms_days?: number;
    notes?: string;
}

export interface UpdateVendorInput extends Partial<CreateVendorInput> {
    is_active?: boolean;
}

export interface CreatePurchaseInput {
    vendor_id: string;
    vendor_name: string;
    product_name: string;
    purchase_price: number;
    quantity: number;
    paid_amount?: number;
    notes?: string;
    currency?: string;
}

export interface UpdatePurchaseInput extends Partial<CreatePurchaseInput> {
    last_shipment_received?: boolean;
    last_shipment_date?: string;
    status?: PurchaseStatus;
}

export interface CreateProductInput {
    vendor_id: string;
    name: string;
    description?: string;
    unit_price: number;
    currency?: string;
    category?: string;
    sku?: string;
}

export interface RecordPaymentInput {
    vendor_id: string;
    purchase_id?: string;
    payment_date: string;
    amount: number;
    currency?: string;
    payment_method?: PaymentMethod;
    reference_number?: string;
    notes?: string;
}

export interface UploadAttachmentInput {
    entity_type: 'vendor' | 'product' | 'purchase' | 'shipment';
    entity_id: string;
    file: File;
}

// =====================================================
// FILTER TYPES
// =====================================================

export interface APFiltersState {
    vendorId?: string;
    status?: PurchaseStatus[];
    dateRange?: {
        start: string;
        end: string;
    };
    searchTerm?: string;
}
