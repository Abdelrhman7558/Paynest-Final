import type { ValidatedPayload, NormalizedEvent } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock Exchange Rates (In production: Fetch from cache/DB)
const EXCHANGE_RATES: Record<string, number> = {
    'USD': 50.5,
    'EUR': 53.2,
    'SAR': 13.4,
    'EGP': 1.0
};

export class NormalizationService {

    private readonly defaultCurrency: string;

    constructor(defaultCurrency = 'EGP') {
        this.defaultCurrency = defaultCurrency;
        console.log(`[Normalization] Default Currency: ${this.defaultCurrency}`); // Silence TS6138
    }

    /**
     * Stage 4: Normalize Payload
     */
    normalize(rawEventId: string, data: ValidatedPayload): NormalizedEvent {
        const rate = this.getExchangeRate(data.currency);
        const baseAmount = data.amount * rate;

        // Ensure timestamp is Date object
        const date = typeof data.timestamp === 'string' ? new Date(data.timestamp) : data.timestamp;

        return {
            id: uuidv4(),
            raw_event_id: rawEventId,
            workspace_id: 'default_workspace', // Context-aware in real app

            amount: data.amount,
            currency: data.currency,
            base_amount: Number(baseAmount.toFixed(4)),
            exchange_rate: rate,

            date: date,

            // Initial classification (refined in next stage)
            intent: this.preClassify(data),
            description: `Transaction from ${data.source_id}`,
            external_id: data.external_id,
            metadata: {}
        };
    }

    private getExchangeRate(currency: string): number {
        return EXCHANGE_RATES[currency] || 1.0;
    }

    private preClassify(data: ValidatedPayload): NormalizedEvent['intent'] {
        // Basic heuristic based on positive/negative amount
        if (data.amount >= 0) return 'REVENUE';
        return 'COST';
    }
}
