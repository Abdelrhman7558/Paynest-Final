import { z } from 'zod';

// Stage 1: Raw Event
export interface RawEvent {
    id: string; // UUID
    source_id: string;
    source_type: 'WEBHOOK' | 'FILE' | 'API';
    payload: Record<string, any>;
    headers?: Record<string, any>;
    ingested_at: Date;
    processing_status: 'PENDING' | 'PROCESSED' | 'FAILED' | 'IGNORED';
}

// Stage 2: Validated Event
export const ValidationSchema = z.object({
    amount: z.number(),
    currency: z.string().length(3, "Currency must be 3-letter ISO code"),
    timestamp: z.string().datetime({ message: "Invalid ISO-8601 timestamp" }).or(z.date()),
    source_id: z.string(),
    type: z.string().optional(),
    external_id: z.string().optional(),
});

export type ValidatedPayload = z.infer<typeof ValidationSchema>;

// Stage 4: Normalized Event (Unified Schema)
export interface NormalizedEvent {
    id: string; // New UUID
    raw_event_id: string;
    workspace_id: string;

    // Financials
    amount: number;
    currency: string;
    base_amount: number; // EGP
    exchange_rate: number;

    // Timing
    date: Date;

    // Classification
    intent: 'REVENUE' | 'COST' | 'WALLET' | 'INVENTORY' | 'ORDER';
    category_id?: string;

    // Metadata
    description: string;
    external_id?: string;
    metadata: Record<string, any>;
}

// Error Handling
export interface PipelineError {
    code: string;
    message: string;
    severity: 'WARN' | 'ERROR' | 'FATAL';
    details?: any;
}
