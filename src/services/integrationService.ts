import { supabase } from '../lib/supabaseClient';

// Types
export interface Integration {
    id: string;
    user_id: string;
    platform: string;
    status: 'connected' | 'disconnected' | 'error' | 'syncing';
    connected_at: string | null;
    last_sync_at: string | null;
    error_state: string | null;
    permissions: string[];
    created_at: string;
    updated_at: string;
}

export interface IntegrationPlatform {
    id: string;
    name: string;
    icon: string;
    description: string;
    permissions: string[];
    category: 'ecommerce' | 'spreadsheet' | 'erp' | 'api';
}

// Available platforms
export const PLATFORMS: IntegrationPlatform[] = [
    {
        id: 'shopify',
        name: 'Shopify',
        icon: '🛒',
        description: 'Sync orders, revenue, and inventory',
        permissions: ['Orders', 'Revenue', 'Refunds', 'Inventory levels'],
        category: 'ecommerce',
    },
    {
        id: 'woocommerce',
        name: 'WooCommerce',
        icon: '🔮',
        description: 'Connect your WordPress store',
        permissions: ['Orders', 'Revenue', 'Products', 'Customers'],
        category: 'ecommerce',
    },
    {
        id: 'google_sheets',
        name: 'Google Sheets',
        icon: '📊',
        description: 'Import data from spreadsheets',
        permissions: ['Read spreadsheet data'],
        category: 'spreadsheet',
    },
    {
        id: 'excel',
        name: 'Excel Online',
        icon: '📗',
        description: 'Connect Microsoft Excel files',
        permissions: ['Read spreadsheet data'],
        category: 'spreadsheet',
    },
    {
        id: 'airtable',
        name: 'Airtable',
        icon: '🗄️',
        description: 'Sync your Airtable bases',
        permissions: ['Read base data', 'Read tables'],
        category: 'spreadsheet',
    },
    {
        id: 'odoo',
        name: 'Odoo',
        icon: '⚙️',
        description: 'Connect your ERP system',
        permissions: ['Sales', 'Inventory', 'Accounting'],
        category: 'erp',
    },
    {
        id: 'rest_api',
        name: 'REST API',
        icon: '🔌',
        description: 'Connect any REST endpoint',
        permissions: ['Custom data access'],
        category: 'api',
    },
    {
        id: 'webhook',
        name: 'Custom Webhook',
        icon: '🔗',
        description: 'Stream data to your webhook',
        permissions: ['Outbound data streaming'],
        category: 'api',
    },
];

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

// Exponential backoff helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    retries = MAX_RETRIES
): Promise<T> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === retries) throw error;
            const waitTime = BASE_DELAY_MS * Math.pow(2, attempt);
            console.log(`Retry attempt ${attempt + 1}/${retries} after ${waitTime}ms`);
            await delay(waitTime);
        }
    }
    throw new Error('Max retries exceeded');
};

// Integration Service
export const IntegrationService = {
    // Get all integrations for a user
    getIntegrations: async (userId: string): Promise<Integration[]> => {
        try {
            const { data, error } = await supabase
                .from('integrations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching integrations:', error);
            return [];
        }
    },

    // Get integration status for a specific platform
    getIntegrationStatus: async (
        userId: string,
        platform: string
    ): Promise<Integration | null> => {
        try {
            const { data, error } = await supabase
                .from('integrations')
                .select('*')
                .eq('user_id', userId)
                .eq('platform', platform)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error fetching integration status:', error);
            return null;
        }
    },

    // Save or update integration
    saveIntegration: async (
        userId: string,
        platform: string,
        status: Integration['status'],
        permissions: string[] = []
    ): Promise<Integration | null> => {
        try {
            const now = new Date().toISOString();

            // Check if integration exists
            const existing = await IntegrationService.getIntegrationStatus(userId, platform);

            if (existing) {
                // Update existing
                const { data, error } = await supabase
                    .from('integrations')
                    .update({
                        status,
                        permissions,
                        connected_at: status === 'connected' ? now : existing.connected_at,
                        last_sync_at: status === 'connected' ? now : existing.last_sync_at,
                        error_state: status === 'error' ? 'Connection failed' : null,
                        updated_at: now,
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                // Create new
                const { data, error } = await supabase
                    .from('integrations')
                    .insert({
                        user_id: userId,
                        platform,
                        status,
                        permissions,
                        connected_at: status === 'connected' ? now : null,
                        last_sync_at: null,
                        error_state: null,
                        created_at: now,
                        updated_at: now,
                    })
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Error saving integration:', error);
            return null;
        }
    },

    // Disconnect integration
    disconnectIntegration: async (userId: string, platform: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('integrations')
                .update({
                    status: 'disconnected',
                    error_state: null,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId)
                .eq('platform', platform);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error disconnecting integration:', error);
            return false;
        }
    },

    // Update sync status with retry
    updateSyncStatus: async (
        userId: string,
        platform: string,
        status: 'syncing' | 'connected' | 'error',
        errorMessage?: string
    ): Promise<boolean> => {
        return retryWithBackoff(async () => {
            const { error } = await supabase
                .from('integrations')
                .update({
                    status,
                    last_sync_at: status === 'connected' ? new Date().toISOString() : undefined,
                    error_state: status === 'error' ? errorMessage : null,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId)
                .eq('platform', platform);

            if (error) throw error;
            return true;
        });
    },

    // Get overall sync status
    getOverallSyncStatus: async (userId: string): Promise<'synced' | 'syncing' | 'error'> => {
        try {
            const integrations = await IntegrationService.getIntegrations(userId);

            if (integrations.some(i => i.status === 'error')) return 'error';
            if (integrations.some(i => i.status === 'syncing')) return 'syncing';
            return 'synced';
        } catch {
            return 'synced';
        }
    },
};
