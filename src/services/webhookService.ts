import { z } from 'zod';

export interface Transaction {
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    category: string;
    date: string;
    status: string;
}

export interface WebhookData {
    transactions: Transaction[];
    wallet: {
        balance: number;
        currency: string;
    };
    generated_at: string;
}

// Flexible Schema to handle potential variations in webhook data
const TransactionSchema = z.object({
    type: z.string().transform(val => val.toUpperCase()),
    amount: z.coerce.number(), // Handle string numbers
    category: z.string().optional().default('Uncategorized'),
    date: z.string().optional().default(() => new Date().toISOString()),
    status: z.string().optional().default('COMPLETED')
});

export const WebhookResponseSchema = z.object({
    transactions: z.array(TransactionSchema),
    wallet: z.object({
        balance: z.coerce.number(),
        currency: z.string().default('EGP')
    }).optional()
});

const WEBHOOK_URL = 'https://n8n.srv1181726.hstgr.cloud/webhook-test/masarefy-all';

export const WebhookDataService = {
    fetchData: async (): Promise<WebhookData> => {
        try {
            const response = await fetch(WEBHOOK_URL);

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn("Webhook 404: Using fallback data structure until webhook is active.");
                    throw new Error("Webhook not registered (404). Please active n8n workflow.");
                }
                throw new Error(`Webhook Error: ${response.statusText}`);
            }

            const raw = await response.json();

            // Validate & Parse
            const result = WebhookResponseSchema.safeParse(raw);

            if (!result.success) {
                console.error("Webhook Schema Validation Failed:", result.error);
                // Attempt to recover partial data or throw
                throw new Error("Invalid Data Format from Webhook");
            }

            // Normalize
            const transactions = result.data.transactions.map(t => ({
                ...t,
                type: (t.type === 'INCOME' || t.type === 'REVENUE' || t.type === 'SALE') ? 'INCOME' : 'EXPENSE'
            })) as Transaction[];

            return {
                transactions,
                wallet: result.data.wallet || { balance: 0, currency: 'EGP' },
                generated_at: new Date().toISOString()
            };

        } catch (error) {
            console.error("Data Fetch Failed:", error);
            throw error;
        }
    }
};
