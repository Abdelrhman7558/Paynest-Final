/**
 * Financial Data Pipeline - Type Definitions
 * Single source of truth for all financial data structures
 */

// ============================================
// 1. RAW INGESTION TYPES
// ============================================

export interface RawWebhookPayload {
    [key: string]: unknown;
}

export interface IngestionRecord {
    ingestionId: string;
    rawPayload: RawWebhookPayload;
    ingestionTimestamp: string; // ISO-8601 UTC
    sourceIdentifier: string;
    isValid: boolean;
    validationErrors: string[];
}

// ============================================
// 2. VALIDATION TYPES
// ============================================

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface ValidatedRecord {
    id: string;
    amount: number;
    currency: string;
    timestamp: string;
    source: string;
    type?: string;
    category?: string;
    metadata?: Record<string, unknown>;
}

// ============================================
// 3. CLASSIFICATION TYPES
// ============================================

export type FinancialClassification =
    | 'REVENUE'
    | 'COST'
    | 'WALLET'
    | 'INVENTORY'
    | 'ORDER'
    | 'UNKNOWN';

export interface ClassifiedRecord extends ValidatedRecord {
    classification: FinancialClassification;
    confidenceScore: number; // 0-1
}

// ============================================
// 4. NORMALIZED TYPES (Final Output)
// ============================================

export interface NormalizedTransaction {
    id: string;
    externalId?: string;

    // Financial
    amount: number;           // Original amount
    currency: string;         // ISO-4217
    amountEGP: number;        // Converted to base currency
    netAmount: number;        // After fees/adjustments

    // Classification
    classification: FinancialClassification;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT';
    category: string;
    subcategory?: string;

    // Temporal
    timestamp: string;        // ISO-8601 UTC
    day: string;              // YYYY-MM-DD
    week: string;             // YYYY-Www
    month: string;            // YYYY-MM

    // Source & Traceability
    source: string;
    sourceType: 'ecommerce' | 'shipping' | 'wallet' | 'manual' | 'import' | 'unknown';
    ingestionId: string;

    // Flags
    isRecurring: boolean;
    isDuplicate: boolean;
    requiresReview: boolean;
    confidenceScore: number;

    // Audit
    createdAt: string;
    updatedAt: string;
}

// ============================================
// 5. ANALYTICS-READY TYPES
// ============================================

export interface RevenueRecord {
    id: string;
    amount: number;
    amountEGP: number;
    currency: string;
    source: string;
    category: string;
    timestamp: string;
    day: string;
    month: string;
    isRecurring: boolean;
}

export interface CostRecord {
    id: string;
    amount: number;
    amountEGP: number;
    currency: string;
    source: string;
    category: string;
    subcategory?: string;
    timestamp: string;
    day: string;
    month: string;
}

export interface WalletRecord {
    id: string;
    amount: number;
    amountEGP: number;
    currency: string;
    walletId: string;
    transactionType: 'deposit' | 'withdrawal' | 'transfer';
    timestamp: string;
    balance?: number;
}

export interface InventoryMovement {
    id: string;
    productId: string;
    productName?: string;
    quantity: number;
    movementType: 'in' | 'out' | 'adjustment';
    unitCost?: number;
    totalValue?: number;
    timestamp: string;
}

export interface OrderRecord {
    id: string;
    externalOrderId: string;
    status: 'created' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    totalAmount: number;
    currency: string;
    itemCount: number;
    timestamp: string;
    customerId?: string;
}

// ============================================
// 6. AGGREGATED ANALYTICS TYPES
// ============================================

export interface TimeSeriesMetric {
    period: string;           // YYYY-MM-DD or YYYY-MM
    periodType: 'day' | 'week' | 'month';
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: number;
    transactionCount: number;
    avgTransactionValue: number;
}

export interface CategoryBreakdown {
    category: string;
    totalAmount: number;
    percentage: number;
    transactionCount: number;
    trend: 'up' | 'down' | 'stable';
}

export interface PipelineStats {
    totalIngested: number;
    totalValid: number;
    totalInvalid: number;
    totalDuplicates: number;
    byClassification: Record<FinancialClassification, number>;
    byCategory: Record<string, number>;
    processingTimeMs: number;
}

// ============================================
// 7. ERROR & AUDIT TYPES
// ============================================

export interface PipelineError {
    id: string;
    ingestionId: string;
    errorType: 'validation' | 'normalization' | 'classification' | 'deduplication';
    errorMessage: string;
    rawData: RawWebhookPayload;
    timestamp: string;
    isResolved: boolean;
}

export interface AuditLog {
    id: string;
    action: 'ingested' | 'validated' | 'classified' | 'normalized' | 'error' | 'reprocessed';
    recordId: string;
    details: string;
    timestamp: string;
    userId?: string;
}
