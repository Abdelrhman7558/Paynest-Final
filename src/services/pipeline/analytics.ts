/**
 * Financial Data Pipeline - Analytics Layer
 * Prepares analytics-ready datasets for dashboard consumption
 */

import type {
    NormalizedTransaction,
    RevenueRecord,
    CostRecord,
    TimeSeriesMetric,
    CategoryBreakdown
} from './types';

// ============================================
// DATASET EXTRACTION
// ============================================

/**
 * Extract revenue records from normalized transactions
 */
export function extractRevenues(transactions: NormalizedTransaction[]): RevenueRecord[] {
    return transactions
        .filter(t => t.classification === 'REVENUE' || t.type === 'INCOME')
        .map(t => ({
            id: t.id,
            amount: t.amount,
            amountEGP: t.amountEGP,
            currency: t.currency,
            source: t.source,
            category: t.category,
            timestamp: t.timestamp,
            day: t.day,
            month: t.month,
            isRecurring: t.isRecurring
        }));
}

/**
 * Extract cost records from normalized transactions
 */
export function extractCosts(transactions: NormalizedTransaction[]): CostRecord[] {
    return transactions
        .filter(t => t.classification === 'COST' || t.type === 'EXPENSE')
        .map(t => ({
            id: t.id,
            amount: Math.abs(t.amount), // Costs as positive values
            amountEGP: Math.abs(t.amountEGP),
            currency: t.currency,
            source: t.source,
            category: t.category,
            subcategory: t.subcategory,
            timestamp: t.timestamp,
            day: t.day,
            month: t.month
        }));
}

// ============================================
// TIME SERIES AGGREGATION
// ============================================

/**
 * Aggregate transactions by period for time series
 */
export function aggregateByPeriod(
    transactions: NormalizedTransaction[],
    periodType: 'day' | 'week' | 'month' = 'day'
): TimeSeriesMetric[] {
    const groups = new Map<string, NormalizedTransaction[]>();

    // Group by period
    for (const t of transactions) {
        let period: string;
        switch (periodType) {
            case 'day':
                period = t.day;
                break;
            case 'week':
                period = t.week;
                break;
            case 'month':
                period = t.month;
                break;
        }

        const existing = groups.get(period) || [];
        existing.push(t);
        groups.set(period, existing);
    }

    // Calculate metrics per period
    const metrics: TimeSeriesMetric[] = [];

    for (const [period, records] of groups.entries()) {
        const revenues = records.filter(r => r.type === 'INCOME');
        const costs = records.filter(r => r.type === 'EXPENSE');

        const totalRevenue = revenues.reduce((sum, r) => sum + r.amountEGP, 0);
        const totalCosts = costs.reduce((sum, r) => sum + Math.abs(r.amountEGP), 0);
        const netProfit = totalRevenue - totalCosts;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        const avgValue = records.length > 0
            ? records.reduce((sum, r) => sum + Math.abs(r.amountEGP), 0) / records.length
            : 0;

        metrics.push({
            period,
            periodType,
            totalRevenue,
            totalCosts,
            netProfit,
            profitMargin,
            transactionCount: records.length,
            avgTransactionValue: avgValue
        });
    }

    // Sort by period
    return metrics.sort((a, b) => a.period.localeCompare(b.period));
}

// ============================================
// CATEGORY BREAKDOWN
// ============================================

/**
 * Get breakdown by category
 */
export function getCategoryBreakdown(
    transactions: NormalizedTransaction[],
    classification?: 'REVENUE' | 'COST'
): CategoryBreakdown[] {
    // Filter by classification if specified
    let filtered = transactions;
    if (classification === 'REVENUE') {
        filtered = transactions.filter(t => t.type === 'INCOME');
    } else if (classification === 'COST') {
        filtered = transactions.filter(t => t.type === 'EXPENSE');
    }

    // Group by category
    const groups = new Map<string, number>();
    for (const t of filtered) {
        const category = t.category || 'Uncategorized';
        const existing = groups.get(category) || 0;
        groups.set(category, existing + Math.abs(t.amountEGP));
    }

    // Calculate total
    const total = Array.from(groups.values()).reduce((sum, v) => sum + v, 0);

    // Build breakdown
    const breakdown: CategoryBreakdown[] = [];
    for (const [category, amount] of groups.entries()) {
        breakdown.push({
            category,
            totalAmount: amount,
            percentage: total > 0 ? (amount / total) * 100 : 0,
            transactionCount: filtered.filter(t => t.category === category).length,
            trend: 'stable' // Would require historical comparison
        });
    }

    // Sort by amount descending
    return breakdown.sort((a, b) => b.totalAmount - a.totalAmount);
}

// ============================================
// KPI CALCULATIONS
// ============================================

export interface DashboardKPIs {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: number;
    walletBalance: number;
    breakEvenStatus: 'profitable' | 'break_even' | 'loss';
    breakEvenAmount: number;
    transactionCount: number;
    avgOrderValue: number;
    revenueGrowth: number;
    costEfficiency: number;
}

/**
 * Calculate dashboard KPIs from normalized transactions
 */
export function calculateDashboardKPIs(transactions: NormalizedTransaction[]): DashboardKPIs {
    const revenues = transactions.filter(t => t.type === 'INCOME');
    const costs = transactions.filter(t => t.type === 'EXPENSE');
    const walletTx = transactions.filter(t => t.classification === 'WALLET');

    const totalRevenue = revenues.reduce((sum, t) => sum + t.amountEGP, 0);
    const totalCosts = costs.reduce((sum, t) => sum + Math.abs(t.amountEGP), 0);
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Wallet balance (simplified - sum of deposits minus withdrawals)
    const walletBalance = walletTx.reduce((sum, t) => sum + t.amountEGP, 0);

    // Break-even analysis
    let breakEvenStatus: DashboardKPIs['breakEvenStatus'] = 'loss';
    let breakEvenAmount = totalCosts - totalRevenue;
    if (netProfit > 0) {
        breakEvenStatus = 'profitable';
        breakEvenAmount = 0;
    } else if (netProfit === 0) {
        breakEvenStatus = 'break_even';
        breakEvenAmount = 0;
    }

    // Average order value
    const avgOrderValue = revenues.length > 0 ? totalRevenue / revenues.length : 0;

    // Cost efficiency (revenue per unit of cost)
    const costEfficiency = totalCosts > 0 ? totalRevenue / totalCosts : 0;

    return {
        totalRevenue,
        totalCosts,
        netProfit,
        profitMargin,
        walletBalance,
        breakEvenStatus,
        breakEvenAmount,
        transactionCount: transactions.length,
        avgOrderValue,
        revenueGrowth: 0, // Would require historical comparison
        costEfficiency
    };
}

// ============================================
// DATA QUALITY REPORTS
// ============================================

export interface DataQualityReport {
    totalRecords: number;
    validRecords: number;
    requiresReview: number;
    lowConfidenceCount: number;
    uncategorizedCount: number;
    duplicatesBlocked: number;
    overallQualityScore: number;
}

/**
 * Generate data quality report
 */
export function generateQualityReport(
    transactions: NormalizedTransaction[],
    duplicatesBlocked: number = 0
): DataQualityReport {
    const requiresReview = transactions.filter(t => t.requiresReview).length;
    const lowConfidence = transactions.filter(t => t.confidenceScore < 0.5).length;
    const uncategorized = transactions.filter(t => t.category === 'Uncategorized').length;

    // Quality score (0-100)
    const total = transactions.length || 1;
    const issueRate = (requiresReview + lowConfidence + uncategorized) / (total * 3);
    const qualityScore = Math.max(0, Math.min(100, (1 - issueRate) * 100));

    return {
        totalRecords: transactions.length,
        validRecords: transactions.length - requiresReview,
        requiresReview,
        lowConfidenceCount: lowConfidence,
        uncategorizedCount: uncategorized,
        duplicatesBlocked,
        overallQualityScore: Math.round(qualityScore)
    };
}
