import { eachDayOfInterval, format, subDays } from 'date-fns';

export interface AnalyticsPeriod {
    start: Date;
    end: Date;
}

export interface DayMetric {
    date: string; // YYYY-MM-DD
    revenue: number;
    costs: number;
    profit: number;
    margin: number;
}

export interface CategoryMetric {
    id: string;
    name: string;
    value: number;
    percentage: number;
}

/**
 * Service to handle Analytics Logic and Aggregation
 * (Mock implementation simulating DB results)
 */
export class AnalyticsService {

    /**
     * Get Main Dashboard Overview (Line Chart + Daily Totals)
     */
    async getDailyOverview(workspaceId: string, period: AnalyticsPeriod): Promise<DayMetric[]> {
        // 1. Generate all dates in range (Zero-Filling Strategy)
        const days = eachDayOfInterval({ start: period.start, end: period.end });

        // 2. Mock Fetch from DB (Simulated)
        const dbResults = this.mockDbFetch(workspaceId, period);

        // 3. Merge and Fill
        return days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const record = dbResults.find(r => r.date === dateKey);

            if (record) return record;

            // Zero-fill missing days
            return {
                date: dateKey,
                revenue: 0,
                costs: 0,
                profit: 0,
                margin: 0
            };
        });
    }

    /**
     * Get Category Breakdown (Donut Chart)
     */
    async getCategoryBreakdown(_workspaceId: string): Promise<CategoryMetric[]> {
        // Mock data
        return [
            { id: 'cat_1', name: 'Marketing (FB Ads)', value: 12500, percentage: 45 },
            { id: 'cat_2', name: 'Shipping (FedEx)', value: 5400, percentage: 19 },
            { id: 'cat_3', name: 'COGS', value: 8900, percentage: 32 },
            { id: 'cat_4', name: 'Software', value: 1100, percentage: 4 }
        ];
    }

    /**
     * Get KPIs Helper
     */
    async getKPIs(workspaceId: string) {
        const metrics = await this.getDailyOverview(workspaceId, {
            start: subDays(new Date(), 30),
            end: new Date()
        });

        const totalRevenue = metrics.reduce((acc, curr) => acc + curr.revenue, 0);
        const totalProfit = metrics.reduce((acc, curr) => acc + curr.profit, 0);

        return {
            totalRevenue,
            totalProfit,
            netMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
            runwayMonths: 12 // Mock
        };
    }

    // --- Private Simulation Helpers ---

    private mockDbFetch(_wsId: string, _period: AnalyticsPeriod): DayMetric[] {
        // Simulate sparse data
        return [
            { date: '2026-01-28', revenue: 5000, costs: 2000, profit: 3000, margin: 60 },
            { date: '2026-01-29', revenue: 7500, costs: 1500, profit: 6000, margin: 80 },
            // Missing dates will be zero-filled by the service
        ];
    }
}
