import type { RawEvent, ValidatedPayload, PipelineError, NormalizedEvent } from './types';
import { ValidationSchema } from './types';
import { NormalizationService } from './normalization';
import { ClassificationEngine } from './classification';
import { v4 as uuidv4 } from 'uuid';

// Mock DB interactions
const db = {
    insertRawEvent: async (event: RawEvent) => {
        console.log(`[DB] Insert RawEvent: ${event.id}`);
        return true;
    },
    updateRawEventStatus: async (id: string, status: string, error?: string) => {
        console.log(`[DB] Update Status: ${id} -> ${status} ${error ? `(${error})` : ''}`);
    },
    insertError: async (error: PipelineError, rawEventId: string) => {
        console.error(`[DB] Insert Error for ${rawEventId}:`, error);
    },
    checkDuplicate: async (_hash: string) => {
        return false;
    },
    saveNormalizedEvent: async (event: NormalizedEvent) => {
        console.log(`[DB] Saving Normalized [${event.intent}]: ${event.amount} ${event.currency} (Base: ${event.base_amount} EGP)`);
        // In real app: INSERT INTO transactions/orders/inventory
    }
};

export class IngestionService {
    private normalizer = new NormalizationService();
    private classifier = new ClassificationEngine();

    /**
     * Stage 1: Ingest Raw Payload
     */
    async ingest(sourceId: string, type: 'WEBHOOK' | 'FILE' | 'API', payload: any): Promise<string> {
        const eventId = uuidv4();

        const rawEvent: RawEvent = {
            id: eventId,
            source_id: sourceId,
            source_type: type,
            payload,
            ingested_at: new Date(),
            processing_status: 'PENDING'
        };

        try {
            await db.insertRawEvent(rawEvent);
            // In a real system, this might be a queue push
            // Awaiting here for the sake of the test script demonstration
            await this.processEvent(rawEvent);
            return eventId;
        } catch (error) {
            console.error("Critical Ingestion Failure", error);
            throw new Error("Ingestion Failed");
        }
    }

    /**
     * Orchestrator for Stages 2 - 6
     */
    private async processEvent(event: RawEvent) {
        try {
            console.log(`Processing Event: ${event.id}`);

            // Stage 2: Validation
            const validationResult = this.validate(event.payload);
            if (!validationResult.success) {
                await this.failEvent(event.id, {
                    code: 'VALIDATION_ERROR',
                    message: 'Payload failed schema validation',
                    severity: 'ERROR',
                    details: validationResult.error
                });
                return;
            }

            const data = validationResult.data;

            // Stage 3: Deduplication
            if (data && await this.checkIdempotency(data, event.source_id)) {
                await db.updateRawEventStatus(event.id, 'IGNORED', 'Duplicate Detected');
                return;
            }

            // Stage 4: Normalization
            const normalized = this.normalizer.normalize(event.id, data!);

            // Stage 5: Classification
            const classified = this.classifier.classify(normalized, event.source_type, event.payload);

            // Stage 6: Persistence
            await db.saveNormalizedEvent(classified);

            // Success
            await db.updateRawEventStatus(event.id, 'PROCESSED');
            console.log(`Pipeline Success: Event ${event.id} -> ${classified.intent}`);

        } catch (e: any) {
            await this.failEvent(event.id, {
                code: 'INTERNAL_ERROR',
                message: e.message || "Unknown error",
                severity: 'FATAL'
            });
        }
    }

    private validate(payload: any): { success: boolean, data?: ValidatedPayload, error?: any } {
        const result = ValidationSchema.safeParse(payload);
        if (!result.success) return { success: false, error: result.error.format() };

        if (result.data.type === 'SALE' && result.data.amount < 0) {
            return { success: false, error: { amount: { _errors: ["Sale amount cannot be negative"] } } };
        }
        return { success: true, data: result.data };
    }

    private async checkIdempotency(_data: ValidatedPayload, _sourceId: string): Promise<boolean> {
        return false; // Mock
    }

    private async failEvent(id: string, error: PipelineError) {
        await db.insertError(error, id);
        await db.updateRawEventStatus(id, 'FAILED', error.message);
    }
}
