/**
 * Financial Data Pipeline - Main Orchestrator
 * Single entry point for processing webhook data
 */

import type {
    RawWebhookPayload,
    NormalizedTransaction,
    PipelineStats,
    FinancialClassification
} from './types';
import { validateBatch } from './validation';
import { processRecords } from './classification';
import { deduplicateBatch } from './deduplication';
import { calculateDashboardKPIs, generateQualityReport } from './analytics';
import type { DashboardKPIs, DataQualityReport } from './analytics';

// ============================================
// PIPELINE RESULT TYPES
// ============================================

export interface PipelineResult {
    success: boolean;
    ingestionId: string;
    transactions: NormalizedTransaction[];
    stats: PipelineStats;
    kpis: DashboardKPIs;
    quality: DataQualityReport;
    processingTimeMs: number;
    errors: { raw: RawWebhookPayload; errors: string[] }[];
}

// ============================================
// MAIN PIPELINE FUNCTION
// ============================================

/**
 * Process raw webhook payloads through the complete pipeline
 */
export async function processWebhookData(
    rawPayloads: RawWebhookPayload[],
    _sourceIdentifier: string = 'webhook'
): Promise<PipelineResult> {
    const startTime = performance.now();
    const ingestionId = `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[Pipeline] Starting ingestion ${ingestionId} with ${rawPayloads.length} records`);

    // 1. VALIDATION LAYER
    const validationResult = validateBatch(rawPayloads);
    console.log(`[Pipeline] Validation: ${validationResult.stats.valid}/${validationResult.stats.total} valid`);

    // 2. CLASSIFICATION & NORMALIZATION LAYER
    const normalized = processRecords(validationResult.valid, ingestionId);
    console.log(`[Pipeline] Classified and normalized ${normalized.length} records`);

    // 3. DEDUPLICATION LAYER
    const dedupeResult = deduplicateBatch(normalized);
    console.log(`[Pipeline] Deduplication: ${dedupeResult.stats.unique} unique, ${dedupeResult.stats.duplicates} duplicates`);

    // 4. ANALYTICS PREPARATION
    const kpis = calculateDashboardKPIs(dedupeResult.unique);
    const quality = generateQualityReport(dedupeResult.unique, dedupeResult.stats.duplicates);

    // 5. BUILD STATS
    const byClassification: Record<FinancialClassification, number> = {
        REVENUE: 0,
        COST: 0,
        WALLET: 0,
        INVENTORY: 0,
        ORDER: 0,
        UNKNOWN: 0
    };

    const byCategory: Record<string, number> = {};

    for (const tx of dedupeResult.unique) {
        byClassification[tx.classification]++;
        byCategory[tx.category] = (byCategory[tx.category] || 0) + 1;
    }

    const processingTimeMs = performance.now() - startTime;

    const stats: PipelineStats = {
        totalIngested: rawPayloads.length,
        totalValid: validationResult.stats.valid,
        totalInvalid: validationResult.stats.invalid,
        totalDuplicates: dedupeResult.stats.duplicates,
        byClassification,
        byCategory,
        processingTimeMs
    };

    console.log(`[Pipeline] Complete in ${processingTimeMs.toFixed(2)}ms`);

    return {
        success: true,
        ingestionId,
        transactions: dedupeResult.unique,
        stats,
        kpis,
        quality,
        processingTimeMs,
        errors: validationResult.invalid
    };
}

// ============================================
// WEBHOOK DATA FETCHER + PROCESSOR
// ============================================

const WEBHOOK_URL = 'https://n8n.srv1181726.hstgr.cloud/webhook-test/masarefy-all';

/**
 * Fetch data from webhook and process through pipeline
 */
export async function fetchAndProcessWebhookData(): Promise<PipelineResult> {
    console.log('[Pipeline] Fetching data from webhook...');

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle different response formats
        let rawPayloads: RawWebhookPayload[];

        if (Array.isArray(data)) {
            rawPayloads = data;
        } else if (data.transactions && Array.isArray(data.transactions)) {
            rawPayloads = data.transactions;
        } else if (data.data && Array.isArray(data.data)) {
            rawPayloads = data.data;
        } else if (data.records && Array.isArray(data.records)) {
            rawPayloads = data.records;
        } else {
            // Single record wrapped in array
            rawPayloads = [data];
        }

        console.log(`[Pipeline] Received ${rawPayloads.length} records from webhook`);

        return processWebhookData(rawPayloads, 'webhook');

    } catch (error) {
        console.error('[Pipeline] Webhook fetch failed:', error);

        return {
            success: false,
            ingestionId: `ing_error_${Date.now()}`,
            transactions: [],
            stats: {
                totalIngested: 0,
                totalValid: 0,
                totalInvalid: 0,
                totalDuplicates: 0,
                byClassification: { REVENUE: 0, COST: 0, WALLET: 0, INVENTORY: 0, ORDER: 0, UNKNOWN: 0 },
                byCategory: {},
                processingTimeMs: 0
            },
            kpis: {
                totalRevenue: 0,
                totalCosts: 0,
                netProfit: 0,
                profitMargin: 0,
                walletBalance: 0,
                breakEvenStatus: 'loss',
                breakEvenAmount: 0,
                transactionCount: 0,
                avgOrderValue: 0,
                revenueGrowth: 0,
                costEfficiency: 0
            },
            quality: {
                totalRecords: 0,
                validRecords: 0,
                requiresReview: 0,
                lowConfidenceCount: 0,
                uncategorizedCount: 0,
                duplicatesBlocked: 0,
                overallQualityScore: 0
            },
            processingTimeMs: 0,
            errors: []
        };
    }
}

// ============================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================

export * from './types';
export * from './validation';
export * from './classification';
export * from './deduplication';
export * from './analytics';
