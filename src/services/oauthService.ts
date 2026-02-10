// Shopify OAuth Configuration
const SHOPIFY_API_KEY = import.meta.env.VITE_SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = import.meta.env.VITE_SHOPIFY_API_SECRET;
const SHOPIFY_SCOPES = "read_all_orders,read_analytics,read_customers,read_inventory,read_inventory_shipments,read_inventory_shipments_received_items,read_locations,read_orders,read_product_listings,read_products,customer_read_companies,customer_read_customers,customer_read_orders";
const SHOPIFY_REDIRECT_URI = "https://n8n.srv1181726.hstgr.cloud/webhook/shopify/callback";

// Google Sheets OAuth Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly";
const GOOGLE_REDIRECT_URI = "https://n8n.srv1181726.hstgr.cloud/webhook-test/sheets";

// Generate random state for CSRF protection
const generateRandomState = (): string => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};

// Store OAuth state with user_id in sessionStorage
const storeOAuthState = (state: string, userId: string): void => {
    const stateData = {
        state,
        userId,
        timestamp: Date.now()
    };
    sessionStorage.setItem('shopify_oauth_state', JSON.stringify(stateData));
};

// Retrieve OAuth state
export const getStoredOAuthState = (): { state: string; userId: string; timestamp: number } | null => {
    const stored = sessionStorage.getItem('shopify_oauth_state');
    if (!stored) return null;
    return JSON.parse(stored);
};

// Retrieve Google OAuth state
export const getStoredGoogleOAuthState = (): { state: string; userId: string; timestamp: number } | null => {
    const stored = sessionStorage.getItem('google_oauth_state');
    if (!stored) return null;
    return JSON.parse(stored);
};

// Clear OAuth state
export const clearOAuthState = (): void => {
    sessionStorage.removeItem('shopify_oauth_state');
};

// Clear Google OAuth state
export const clearGoogleOAuthState = (): void => {
    sessionStorage.removeItem('google_oauth_state');
};

// OAuth Service
export const OAuthService = {
    /**
     * Validate Shopify domain format
     * @param domain - The shop domain to validate
     * @returns boolean - True if valid Shopify domain
     */
    validateShopifyDomain: (domain: string): boolean => {
        // Must match: storename.myshopify.com pattern
        const pattern = /^([a-z0-9-]+)\.myshopify\.com$/i;
        return pattern.test(domain.trim());
    },

    /**
     * Initiate Shopify OAuth flow
     * Validates domain, generates state with user_id, and redirects to Shopify authorization
     * @param shopDomain - The Shopify store domain (e.g., mystore.myshopify.com)
     * @param userId - The current user's ID to track the connection
     */
    initiateShopifyAuth: (shopDomain: string, userId: string): void => {
        // 1️⃣ Clean and validate domain
        const cleanDomain = shopDomain
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/\/$/, '');

        if (!OAuthService.validateShopifyDomain(cleanDomain)) {
            throw new Error('Invalid Shopify domain format. Use: yourstore.myshopify.com');
        }

        // 2️⃣ Generate state for CSRF protection and encode user_id
        const randomState = generateRandomState();
        const returnUrl = window.location.origin;
        const stateWithUserId = `${randomState}:${userId}:${returnUrl}`; // Format: randomString:userId:returnUrl
        storeOAuthState(randomState, userId);

        // 3️⃣ Build Shopify OAuth URL
        const authUrl = `https://${cleanDomain}/admin/oauth/authorize?` +
            `client_id=${SHOPIFY_API_KEY}` +
            `&scope=${SHOPIFY_SCOPES}` +
            `&redirect_uri=${encodeURIComponent(SHOPIFY_REDIRECT_URI)}` +
            `&state=${encodeURIComponent(stateWithUserId)}` +
            `&grant_options[]=per-user`;

        // 4️⃣ Console log for debugging
        console.log('🔗 Shopify OAuth Configuration:');
        console.log('   Shop Domain:', cleanDomain);
        console.log('   API Key:', SHOPIFY_API_KEY);
        console.log('   Scopes:', SHOPIFY_SCOPES);
        console.log('   Redirect URI:', SHOPIFY_REDIRECT_URI);
        console.log('   State (with user_id):', stateWithUserId);
        console.log('   User ID:', userId);
        console.log('📍 Redirecting to Shopify OAuth URL:', authUrl);

        // 5️⃣ Redirect user to Shopify
        window.location.href = authUrl;
    },

    /**
     * Initiate Google Sheets OAuth flow
     * Generates state with user_id and redirects to Google OAuth consent screen
     * @param userId - The current user's ID to track the connection
     */
    initiateGoogleSheetsAuth: (userId: string): void => {
        // 1️⃣ Use userId directly as state for n8n webhook compatibility
        const state = userId;

        // 2️⃣ Build Google OAuth URL
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
            `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(GOOGLE_SCOPES)}` +
            `&access_type=offline` +
            `&prompt=consent` +
            `&state=${encodeURIComponent(state)}`;

        // 3️⃣ Console log for debugging
        console.log('📊 Google Sheets OAuth Configuration:');
        console.log('   Client ID:', GOOGLE_CLIENT_ID);
        console.log('   Scopes:', GOOGLE_SCOPES);
        console.log('   Redirect URI:', GOOGLE_REDIRECT_URI);
        console.log('   State (User ID):', state);
        console.log('📍 Redirecting to Google OAuth URL:', authUrl);

        // 4️⃣ Redirect user to Google
        window.location.href = authUrl;
    },

    /**
     * Get configuration (for debugging/display)
     */
    getConfig: () => ({
        shopify: {
            apiKey: SHOPIFY_API_KEY,
            apiSecret: SHOPIFY_API_SECRET,
            scopes: SHOPIFY_SCOPES,
            redirectUri: SHOPIFY_REDIRECT_URI,
        },
        googleSheets: {
            clientId: GOOGLE_CLIENT_ID,
            scopes: GOOGLE_SCOPES,
            redirectUri: GOOGLE_REDIRECT_URI,
        },
    }),
};

// Export for direct imports
export default OAuthService;
