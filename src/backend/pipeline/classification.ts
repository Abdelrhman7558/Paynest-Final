import type { NormalizedEvent } from './types';

export class ClassificationEngine {

    /**
     * Stage 5: Classify Event Intent
     */
    classify(event: NormalizedEvent, sourceType: string, payload: any): NormalizedEvent {
        const context = {
            amount: event.amount,
            source: sourceType,
            desc: event.description.toLowerCase(),
            payloadType: payload.type?.toLowerCase()
        };

        // 1. Inventory Logic
        if (payload.sku && (payload.quantity || payload.inventory_delta)) {
            event.intent = 'INVENTORY';
            return event;
        }

        // 2. Order Logic
        if (context.payloadType === 'order' || payload.line_items) {
            event.intent = 'ORDER';
            return event;
        }

        // 3. Wallet Logic (Transfers)
        if (['transfer', 'deposit', 'withdrawal'].includes(context.payloadType)) {
            event.intent = 'WALLET';
            return event;
        }

        // 4. Financial Logic (Revenue vs Cost)
        if (event.amount > 0) {
            // Exclude refunds/adjustments from Revenue if needed
            if (context.payloadType === 'refund') {
                event.intent = 'COST';
            } else {
                event.intent = 'REVENUE';
            }
        } else {
            event.intent = 'COST';
        }

        return event;
    }
}
