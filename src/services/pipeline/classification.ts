/**
 * Financial Data Pipeline - Classification & Normalization Layer
 * Classifies financial intent and normalizes to unified schema
 */

import type {
    ValidatedRecord,
    ClassifiedRecord,
    NormalizedTransaction,
    FinancialClassification
} from './types';

// ============================================
// CURRENCY CONVERSION RATES (to EGP)
// In production, fetch from API
// ============================================

const CURRENCY_RATES: Record<string, number> = {
    'EGP': 1,
    'USD': 49.50,
    'EUR': 53.80,
    'GBP': 62.50,
    'SAR': 13.20,
    'AED': 13.48,
    'KWD': 161.50,
    'QAR': 13.60,
    'BHD': 131.38,
    'OMR': 128.70
};

// ============================================
// CLASSIFICATION RULES
// ============================================

const REVENUE_KEYWORDS = [
    'sale', 'order', 'payment', 'income', 'revenue', 'subscription',
    'purchase', 'checkout', 'paid', 'received', 'earning'
];

const COST_KEYWORDS = [
    'expense', 'cost', 'fee', 'shipping', 'delivery', 'marketing',
    'ad', 'ads', 'advertising', 'salary', 'rent', 'utility', 'refund',
    'commission', 'platform_fee', 'tax', 'vat', 'duty'
];

const WALLET_KEYWORDS = [
    'wallet', 'balance', 'transfer', 'deposit', 'withdrawal', 'topup',
    'payout', 'settlement', 'bank'
];

const INVENTORY_KEYWORDS = [
    'inventory', 'stock', 'product', 'item', 'sku', 'quantity',
    'received', 'adjustment', 'count'
];

const ORDER_KEYWORDS = [
    'order', 'fulfillment', 'shipment', 'delivery', 'tracking',
    'created', 'confirmed', 'shipped', 'delivered', 'cancelled'
];

// ============================================
// CATEGORY MAPPINGS
// ============================================

const CATEGORY_MAPPINGS: Record<string, string> = {
    // Revenue categories
    'sale': 'Sales',
    'order': 'Sales',
    'subscription': 'Subscription Revenue',

    // Cost categories
    'shipping': 'Shipping & Delivery',
    'delivery': 'Shipping & Delivery',
    'marketing': 'Marketing',
    'ads': 'Advertising',
    'advertising': 'Advertising',
    'ad': 'Advertising',
    'fee': 'Platform Fees',
    'commission': 'Platform Fees',
    'salary': 'Payroll',
    'rent': 'Rent & Utilities',
    'utility': 'Rent & Utilities',
    'cogs': 'Cost of Goods Sold',
    'refund': 'Refunds & Returns',

    // Wallet categories
    'deposit': 'Deposits',
    'withdrawal': 'Withdrawals',
    'transfer': 'Transfers',
    'payout': 'Payouts',

    // Default
    'unknown': 'Uncategorized'
};

// ============================================
// CLASSIFICATION LOGIC
// ============================================

function matchesKeywords(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    let matches = 0;
    for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
            matches++;
        }
    }
    return matches;
}

export function classifyRecord(record: ValidatedRecord): ClassifiedRecord {
    const textToAnalyze = [
        record.type || '',
        record.category || '',
        record.source || '',
        JSON.stringify(record.metadata || {})
    ].join(' ').toLowerCase();

    // Score each classification
    const scores: Record<FinancialClassification, number> = {
        'REVENUE': matchesKeywords(textToAnalyze, REVENUE_KEYWORDS),
        'COST': matchesKeywords(textToAnalyze, COST_KEYWORDS),
        'WALLET': matchesKeywords(textToAnalyze, WALLET_KEYWORDS),
        'INVENTORY': matchesKeywords(textToAnalyze, INVENTORY_KEYWORDS),
        'ORDER': matchesKeywords(textToAnalyze, ORDER_KEYWORDS),
        'UNKNOWN': 0
    };

    // Use amount sign as a hint
    if (record.amount > 0) {
        scores['REVENUE'] += 0.5;
    } else if (record.amount < 0) {
        scores['COST'] += 0.5;
    }

    // Find highest score
    let maxScore = 0;
    let classification: FinancialClassification = 'UNKNOWN';

    for (const [cls, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            classification = cls as FinancialClassification;
        }
    }

    // Calculate confidence (normalized)
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidenceScore = totalScore > 0 ? maxScore / totalScore : 0.1;

    return {
        ...record,
        classification,
        confidenceScore: Math.min(1, Math.max(0.1, confidenceScore))
    };
}

// ============================================
// CATEGORIZATION LOGIC
// ============================================

export function categorizeRecord(record: ClassifiedRecord): string {
    // Check explicit category first
    if (record.category) {
        const mapped = CATEGORY_MAPPINGS[record.category.toLowerCase()];
        if (mapped) return mapped;
    }

    // Check type
    if (record.type) {
        const mapped = CATEGORY_MAPPINGS[record.type.toLowerCase()];
        if (mapped) return mapped;
    }

    // Check source for hints
    const source = record.source.toLowerCase();
    if (source.includes('shipping') || source.includes('aramex') || source.includes('fedex')) {
        return 'Shipping & Delivery';
    }
    if (source.includes('facebook') || source.includes('google') || source.includes('tiktok')) {
        return 'Advertising';
    }

    // Default based on classification
    switch (record.classification) {
        case 'REVENUE':
            return 'Sales';
        case 'COST':
            return 'Operating Expenses';
        case 'WALLET':
            return 'Wallet Transactions';
        case 'INVENTORY':
            return 'Inventory';
        case 'ORDER':
            return 'Orders';
        default:
            return 'Uncategorized';
    }
}

// ============================================
// NORMALIZATION LOGIC
// ============================================

export function normalizeRecord(
    record: ClassifiedRecord,
    ingestionId: string
): NormalizedTransaction {
    // Convert to base currency
    const rate = CURRENCY_RATES[record.currency] || 1;
    const amountEGP = record.amount * rate;

    // Parse timestamp for temporal fields
    const date = new Date(record.timestamp);
    const day = record.timestamp.split('T')[0];
    const week = getISOWeek(date);
    const month = day.substring(0, 7);

    // Determine transaction type
    let type: NormalizedTransaction['type'] = 'ADJUSTMENT';
    if (record.classification === 'REVENUE') {
        type = 'INCOME';
    } else if (record.classification === 'COST') {
        type = 'EXPENSE';
    } else if (record.classification === 'WALLET') {
        type = 'TRANSFER';
    }

    // Determine source type
    let sourceType: NormalizedTransaction['sourceType'] = 'unknown';
    const source = record.source.toLowerCase();
    if (['shopify', 'woocommerce', 'salla', 'zid', 'amazon', 'noon'].some(s => source.includes(s))) {
        sourceType = 'ecommerce';
    } else if (['aramex', 'fedex', 'dhl', 'bosta'].some(s => source.includes(s))) {
        sourceType = 'shipping';
    } else if (['paypal', 'stripe', 'paymob', 'fawry'].some(s => source.includes(s))) {
        sourceType = 'wallet';
    } else if (['manual', 'excel', 'csv'].some(s => source.includes(s))) {
        sourceType = 'manual';
    }

    // Get category
    const category = categorizeRecord(record);

    const now = new Date().toISOString();

    return {
        id: record.id,
        externalId: record.metadata?.external_id as string | undefined,

        // Financial
        amount: record.amount,
        currency: record.currency,
        amountEGP,
        netAmount: amountEGP, // Could be adjusted for fees

        // Classification
        classification: record.classification,
        type,
        category,
        subcategory: undefined,

        // Temporal
        timestamp: record.timestamp,
        day,
        week,
        month,

        // Source & Traceability
        source: record.source,
        sourceType,
        ingestionId,

        // Flags
        isRecurring: false, // Could be detected from patterns
        isDuplicate: false,
        requiresReview: record.confidenceScore < 0.5,
        confidenceScore: record.confidenceScore,

        // Audit
        createdAt: now,
        updatedAt: now
    };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getISOWeek(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

// ============================================
// BATCH PROCESSING
// ============================================

export function processRecords(
    validatedRecords: ValidatedRecord[],
    ingestionId: string
): NormalizedTransaction[] {
    return validatedRecords
        .map(record => classifyRecord(record))
        .map(record => normalizeRecord(record, ingestionId));
}
