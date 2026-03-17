/**
 * Financial Data Pipeline - Validation Layer
 * Validates incoming data against strict rules
 */

import type { RawWebhookPayload, ValidationResult, ValidatedRecord } from './types';

// ISO 4217 Currency Codes (Common subset)
const VALID_CURRENCIES = new Set([
    'EGP', 'USD', 'EUR', 'GBP', 'SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR',
    'JOD', 'LBP', 'SYP', 'IQD', 'MAD', 'TND', 'DZD', 'LYD', 'SDG'
]);

// Known source identifiers
const KNOWN_SOURCES = new Set([
    'shopify', 'woocommerce', 'magento', 'amazon', 'noon', 'jumia',
    'salla', 'zid', 'expandcart', 'youcan', 'ecwid',
    'paypal', 'stripe', 'paymob', 'fawry', 'vodafone_cash',
    'fedex', 'aramex', 'dhl', 'bosta', 'mylerz',
    'excel', 'csv', 'manual', 'api', 'webhook'
]);

/**
 * Generate a deterministic hash for deduplication
 */
export function generateRecordHash(amount: number, timestamp: string, source: string): string {
    const input = `${amount}-${timestamp}-${source}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Parse and validate timestamp
 */
export function parseTimestamp(value: unknown): { valid: boolean; timestamp: string | null } {
    if (!value) {
        return { valid: false, timestamp: null };
    }

    const str = String(value);

    // Try ISO-8601 format
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
        return { valid: true, timestamp: date.toISOString() };
    }

    // Try Unix timestamp (seconds)
    const unixSeconds = Number(str);
    if (!isNaN(unixSeconds) && unixSeconds > 1000000000 && unixSeconds < 2000000000) {
        return { valid: true, timestamp: new Date(unixSeconds * 1000).toISOString() };
    }

    // Try Unix timestamp (milliseconds)
    if (!isNaN(unixSeconds) && unixSeconds > 1000000000000) {
        return { valid: true, timestamp: new Date(unixSeconds).toISOString() };
    }

    return { valid: false, timestamp: null };
}

/**
 * Validate currency code
 */
export function validateCurrency(value: unknown): boolean {
    if (!value || typeof value !== 'string') return false;
    return VALID_CURRENCIES.has(value.toUpperCase());
}

/**
 * Validate amount
 */
export function validateAmount(value: unknown): { valid: boolean; amount: number; warnings: string[] } {
    const warnings: string[] = [];

    if (value === undefined || value === null) {
        return { valid: false, amount: 0, warnings: ['Amount is missing'] };
    }

    const num = Number(value);

    if (isNaN(num)) {
        return { valid: false, amount: 0, warnings: ['Amount is not a valid number'] };
    }

    if (num === 0) {
        warnings.push('Zero-value record detected');
    }

    if (num < 0) {
        warnings.push('Negative amount detected - may be a refund or adjustment');
    }

    return { valid: true, amount: num, warnings };
}

/**
 * Main validation function
 */
export function validateRecord(raw: RawWebhookPayload): ValidationResult & { record?: ValidatedRecord } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Extract fields (try multiple common field names)
    const id = raw.id || raw._id || raw.external_id || raw.orderId || raw.transaction_id;
    const amountRaw = raw.amount || raw.total || raw.value || raw.price || raw.sum;
    const currencyRaw = raw.currency || raw.currency_code || 'EGP';
    const timestampRaw = raw.timestamp || raw.created_at || raw.date || raw.createdAt || raw.time;
    const sourceRaw = raw.source || raw.platform || raw.origin || 'unknown';
    const typeRaw = raw.type || raw.transaction_type || raw.kind;
    const categoryRaw = raw.category || raw.tag || raw.label;

    // Validate amount
    const amountResult = validateAmount(amountRaw);
    if (!amountResult.valid) {
        errors.push('Amount must be a valid number');
    }
    warnings.push(...amountResult.warnings);

    // Validate currency
    const currency = String(currencyRaw).toUpperCase();
    if (!validateCurrency(currency)) {
        errors.push(`Invalid currency code: ${currency}`);
    }

    // Validate timestamp
    const timestampResult = parseTimestamp(timestampRaw);
    if (!timestampResult.valid) {
        errors.push('Timestamp must be a valid date format');
    }

    // Validate source (warning only, not blocking)
    const source = String(sourceRaw).toLowerCase();
    if (!KNOWN_SOURCES.has(source) && source !== 'unknown') {
        warnings.push(`Unknown source: ${source}`);
    }

    // Generate ID if not present
    const recordId = id
        ? String(id)
        : generateRecordHash(amountResult.amount, timestampResult.timestamp || '', source);

    if (errors.length > 0) {
        return { isValid: false, errors, warnings };
    }

    const record: ValidatedRecord = {
        id: recordId,
        amount: amountResult.amount,
        currency,
        timestamp: timestampResult.timestamp!,
        source,
        type: typeRaw ? String(typeRaw) : undefined,
        category: categoryRaw ? String(categoryRaw) : undefined,
        metadata: raw
    };

    return { isValid: true, errors: [], warnings, record };
}

/**
 * Batch validation
 */
export function validateBatch(records: RawWebhookPayload[]): {
    valid: ValidatedRecord[];
    invalid: { raw: RawWebhookPayload; errors: string[] }[];
    stats: { total: number; valid: number; invalid: number };
} {
    const valid: ValidatedRecord[] = [];
    const invalid: { raw: RawWebhookPayload; errors: string[] }[] = [];

    for (const raw of records) {
        const result = validateRecord(raw);
        if (result.isValid && result.record) {
            valid.push(result.record);
        } else {
            invalid.push({ raw, errors: result.errors });
        }
    }

    return {
        valid,
        invalid,
        stats: {
            total: records.length,
            valid: valid.length,
            invalid: invalid.length
        }
    };
}
