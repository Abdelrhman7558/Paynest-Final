import { IngestionService } from './ingestion';

async function testPipeline() {
    console.log("--- Starting Pipeline Integrity Test ---");
    const ingest = new IngestionService();

    // 1. Test Valid Sale
    console.log("\n1. Testing Valid Revenue...");
    await ingest.ingest("shopify_store_1", "WEBHOOK", {
        amount: 100.00,
        currency: "USD",
        timestamp: new Date().toISOString(),
        source_id: "order_123",
        external_id: "shp_555",
        type: "sale"
    });

    // 2. Test Cost (Ad Spend)
    console.log("\n2. Testing Cost (Ads)...");
    await ingest.ingest("facebook_ads", "API", {
        amount: -500.00,
        currency: "EGP",
        timestamp: new Date().toISOString(),
        source_id: "fb_campaign_1",
        description: "FB Ads Jan",
        type: "fee"
    });

    // 3. Test Invalid Data
    console.log("\n3. Testing Malformed Data...");
    await ingest.ingest("manual_upload", "FILE", {
        amount: "not-a-number",
        currency: "US", // Invalid ISO
        timestamp: "tomorrow" // Invalid format logic
    });
}

testPipeline().catch(console.error);
