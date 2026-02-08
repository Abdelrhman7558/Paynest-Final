/**
 * Financial Data Pipeline - Deduplication Layer
 * Ensures idempotent ingestion and prevents duplicate records
 */

import type { NormalizedTransaction } from './types';

// In-memory store for demonstration
// In production, use Redis or database with proper TTL
const seenHashes = new Map<string, { firstSeen: string; count: number }>();

/**
 * Generate a unique hash for deduplication
 */
export function generateDeduplicationKey(record: NormalizedTransaction): string {
    // Use external ID if available (most reliable)
    if (record.externalId) {
        return `ext_${record.source}_${record.externalId}`;
    }

    // Otherwise create a composite key
    const components = [
        record.amount.toFixed(2),
        record.timestamp,
        record.source,
        record.type,
        record.category
    ].join('|');

    // Simple hash
    let hash = 0;
    for (let i = 0; i < components.length; i++) {
        const char = components.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Check if record is a duplicate
 */
export function isDuplicate(record: NormalizedTransaction): boolean {
    const key = generateDeduplicationKey(record);
    return seenHashes.has(key);
}

/**
 * Mark record as seen
 */
export function markAsSeen(record: NormalizedTransaction): void {
    const key = generateDeduplicationKey(record);
    const existing = seenHashes.get(key);

    if (existing) {
        existing.count++;
    } else {
        seenHashes.set(key, {
            firstSeen: new Date().toISOString(),
            count: 1
        });
    }
}

/**
 * Deduplicate a batch of records
 */
export function deduplicateBatch(records: NormalizedTransaction[]): {
    unique: NormalizedTransaction[];
    duplicates: NormalizedTransaction[];
    stats: { total: number; unique: number; duplicates: number };
} {
    const unique: NormalizedTransaction[] = [];
    const duplicates: NormalizedTransaction[] = [];
    const batchSeen = new Set<string>();

    for (const record of records) {
        const key = generateDeduplicationKey(record);

        // Check global store
        if (seenHashes.has(key)) {
            record.isDuplicate = true;
            duplicates.push(record);
            markAsSeen(record); // Increment count
            continue;
        }

        // Check within current batch
        if (batchSeen.has(key)) {
            record.isDuplicate = true;
            duplicates.push(record);
            continue;
        }

        // New record
        batchSeen.add(key);
        markAsSeen(record);
        unique.push(record);
    }

    return {
        unique,
        duplicates,
        stats: {
            total: records.length,
            unique: unique.length,
            duplicates: duplicates.length
        }
    };
}

/**
 * Clear the deduplication cache (for testing)
 */
export function clearDeduplicationCache(): void {
    seenHashes.clear();
}

/**
 * Get deduplication stats
 */
export function getDeduplicationStats(): {
    trackedRecords: number;
    totalDuplicatesBlocked: number;
} {
    let totalDuplicates = 0;
    for (const entry of seenHashes.values()) {
        totalDuplicates += entry.count - 1; // First occurrence is not a duplicate
    }

    return {
        trackedRecords: seenHashes.size,
        totalDuplicatesBlocked: totalDuplicates
    };
}
