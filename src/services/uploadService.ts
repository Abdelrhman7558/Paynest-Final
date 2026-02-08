import { supabase } from '../lib/supabaseClient';

// Types
export interface UploadMetadata {
    id: string;
    user_id: string;
    workspace_id: string | null;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
    source: 'manual_upload';
    data_type?: string; // Added data_type
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
}

export interface WebhookPayload {
    user_id: string;
    workspace_id: string | null;
    file_id: string; // Changed from implicit url to explicit ID
    data_type: string; // Added data_type
    file_url: string;
    file_type: string;
    file_name: string;
    file_size: number;
    timestamp: string;
}

export interface WebhookResponse {
    success: boolean;
    status: number;
    message?: string;
}

// Configuration
const UPLOAD_WEBHOOK_URL = 'https://n8n.srv1181726.hstgr.cloud/webhook-test/upload-sheet';
const STORAGE_BUCKET = 'uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['xlsx', 'csv', 'xls'];
const ALLOWED_MIME_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'text/csv', // csv
    'application/csv',
];

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

// Helpers
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
};

const getMimeType = (file: File): string => {
    // Use file type or infer from extension
    if (file.type) return file.type;
    const ext = getFileExtension(file.name);
    const mimeMap: Record<string, string> = {
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        xls: 'application/vnd.ms-excel',
        csv: 'text/csv',
    };
    return mimeMap[ext] || 'application/octet-stream';
};

// Validation
export const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check size
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
    }

    // Check extension
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` };
    }

    // Check MIME type (if available)
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
        // Allow if extension is valid even if MIME is unknown
        console.warn('MIME type not in allowed list, but extension is valid:', file.type);
    }

    return { valid: true };
};

// Retry with exponential backoff
const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    retries = MAX_RETRIES,
    context = 'operation'
): Promise<T> => {
    let lastError: Error | unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt === retries) break;

            const waitTime = BASE_DELAY_MS * Math.pow(2, attempt);
            console.log(`[${context}] Retry ${attempt + 1}/${retries} after ${waitTime}ms`);
            await delay(waitTime);
        }
    }

    console.error(`[${context}] Max retries exceeded:`, lastError);
    throw lastError;
};

// Upload Service
export const UploadService = {
    // Upload file to Supabase Storage
    uploadToSupabase: async (
        file: File,
        userId: string,
        _workspaceId?: string
    ): Promise<{ url: string; path: string } | null> => {
        try {
            // Generate unique filename
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${userId}/${timestamp}_${safeName}`;

            // Upload to storage
            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: getMimeType(file),
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(data.path);

            return {
                url: urlData.publicUrl,
                path: data.path,
            };
        } catch (error) {
            console.error('Error uploading to Supabase:', error);
            return null;
        }
    },

    // Save upload metadata to database
    saveUploadMetadata: async (
        userId: string,
        workspaceId: string | null,
        file: File,
        fileUrl: string,
        dataType: string, // Added param
        status: UploadMetadata['status'] = 'uploading'
    ): Promise<UploadMetadata | null> => {
        try {
            const now = new Date().toISOString();

            const { data, error } = await supabase
                .from('file_uploads')
                .insert({
                    user_id: userId,
                    workspace_id: workspaceId,
                    file_name: file.name,
                    file_url: fileUrl,
                    file_type: getMimeType(file),
                    file_size: file.size,
                    source: 'manual_upload',
                    // data_type: dataType, // Assuming column exists or will be ignored if not. 
                    // NOTE: User didn't ask to save to DB, but good practice. 
                    // If column missing, this might fail. Safest to NOT add to insert unless confident.
                    // For now, I will omit it from the DB insert to avoid schema errors, 
                    // unless the user specifically requested DB persistance for it.
                    // The prompt was "send to webhook".
                    // I'll assume standard logging fields only.
                    status,
                    created_at: now,
                    updated_at: now,
                })
                .select()
                .single();

            if (error) throw error;
            return { ...data, data_type: dataType }; // Return with data_type attached for flow
        } catch (error) {
            console.error('Error saving upload metadata:', error);
            return null;
        }
    },

    // Update upload status
    updateUploadStatus: async (
        uploadId: string,
        status: UploadMetadata['status']
    ): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('file_uploads')
                .update({
                    status,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', uploadId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating upload status:', error);
            return false;
        }
    },

    // Send file data to webhook with retry
    sendToWebhook: async (
        payload: WebhookPayload
    ): Promise<WebhookResponse> => {
        return retryWithBackoff(async () => {
            console.log('🚀 Sending payload to webhook:', payload);
            const response = await fetch(UPLOAD_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // Log response for audit
            console.log(`[Webhook] Response status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`Webhook failed with status ${response.status}`);
            }

            return {
                success: true,
                status: response.status,
                message: 'Webhook delivered successfully',
            };
        }, MAX_RETRIES, 'Webhook');
    },

    // Full upload flow
    uploadFile: async (
        file: File,
        userId: string,
        dataType: string, // Added param
        workspaceId?: string
    ): Promise<{
        success: boolean;
        uploadId?: string;
        fileUrl?: string;
        error?: string;
    }> => {
        try {
            // 1. Validate file
            const validation = validateFile(file);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            // 2. Upload to Supabase
            const uploadResult = await UploadService.uploadToSupabase(file, userId, workspaceId);
            if (!uploadResult) {
                return { success: false, error: 'Failed to upload file to storage' };
            }

            // 3. Save metadata
            const metadata = await UploadService.saveUploadMetadata(
                userId,
                workspaceId || null,
                file,
                uploadResult.url,
                dataType,
                'processing'
            );

            // 4. Send to webhook (non-blocking, but with retry)
            const webhookPayload: WebhookPayload = {
                user_id: userId,
                workspace_id: workspaceId || null,
                file_id: metadata?.id || 'unknown_id', // Send DB ID if available
                data_type: dataType,
                file_url: uploadResult.url,
                file_type: getMimeType(file),
                file_name: file.name,
                file_size: file.size,
                timestamp: new Date().toISOString(),
            };

            // Fire webhook (don't block on response)
            UploadService.sendToWebhook(webhookPayload)
                .then(() => {
                    if (metadata) {
                        UploadService.updateUploadStatus(metadata.id, 'completed');
                    }
                })
                .catch((error) => {
                    console.error('Webhook delivery failed:', error);
                    if (metadata) {
                        UploadService.updateUploadStatus(metadata.id, 'failed');
                    }
                });

            return {
                success: true,
                uploadId: metadata?.id,
                fileUrl: uploadResult.url,
            };
        } catch (error) {
            console.error('Upload flow error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed',
            };
        }
    },
};
