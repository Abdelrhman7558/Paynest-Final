import { AnalyticsService } from './analytics';
import { subDays } from 'date-fns';

async function testAnalytics() {
    console.log("--- Testing Analytics Service ---");
    const service = new AnalyticsService();
    const wsId = "workspace_1";

    const period = {
        start: subDays(new Date(), 5), // Last 5 days
        end: new Date()
    };

    console.log(`\n1. Fetching Daily Overview (${period.start.toISOString()} to ${period.end.toISOString()})`);
    const overview = await service.getDailyOverview(wsId, period);

    console.table(overview);

    console.log("\n2. Fetching Category Breakdown");
    const categories = await service.getCategoryBreakdown(wsId);
    console.table(categories);

    console.log("\n3. Fetching KPIs");
    const kpis = await service.getKPIs(wsId);
    console.log(kpis);
}

testAnalytics().catch(console.error);
