export class WebhookValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WebhookValidationError';
    }
}

export const validateUserId = (userId: string | undefined | null): string => {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw new WebhookValidationError('User ID is missing or invalid');
    }
    return userId;
};

export const logWebhookCall = (
    method: string,
    endpoint: string,
    userId: string,
    success: boolean,
    details?: any
) => {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILURE';
    const color = success ? '#10B981' : '#EF4444'; // Green or Red

    console.groupCollapsed(
        `%cWrapper Call: ${method} ${endpoint} - ${status}`,
        `color: ${color}; font-weight: bold;`
    );
    console.log('Timestamp:', timestamp);
    console.log('User ID:', userId);
    if (details) {
        console.log('Details:', details);
    }
    console.groupEnd();
};
