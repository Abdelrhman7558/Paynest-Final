-- Analytics Layer: Materialized Views & Aggregations

-- 1. Daily Metrics Summary (MVIEW)
-- Refreshed periodically (e.g., every 15 mins)
CREATE MATERIALIZED VIEW analytics_daily_overview AS
SELECT
    workspace_id,
    DATE(date) as report_date,
    
    -- Revenue
    SUM(CASE WHEN type = 'INCOME' THEN reporting_amount ELSE 0 END) as total_revenue,
    count(CASE WHEN type = 'INCOME' THEN 1 END) as transaction_count,
    
    -- Costs
    ABS(SUM(CASE WHEN type = 'EXPENSE' THEN reporting_amount ELSE 0 END)) as total_expenses,
    
    -- Net
    SUM(reporting_amount) as net_profit,
    
    -- Margins
    CASE 
        WHEN SUM(CASE WHEN type = 'INCOME' THEN reporting_amount ELSE 0 END) = 0 THEN 0
        ELSE (SUM(reporting_amount) / SUM(CASE WHEN type = 'INCOME' THEN reporting_amount ELSE 0 END)) * 100 
    END as net_margin_percent,

    MAX(updated_at) as last_data_update
FROM transactions
WHERE status = 'COMPLETED'
GROUP BY workspace_id, DATE(date);

CREATE UNIQUE INDEX idx_analytics_daily ON analytics_daily_overview(workspace_id, report_date);

-- 2. Category Breakdown (MVIEW)
CREATE MATERIALIZED VIEW analytics_category_performance AS
SELECT 
    t.workspace_id,
    DATE_TRUNC('month', t.date) as month,
    c.name as category_name,
    c.type as category_type,
    ABS(SUM(t.reporting_amount)) as total_amount,
    COUNT(*) as transaction_count
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.status = 'COMPLETED'
GROUP BY t.workspace_id, DATE_TRUNC('month', t.date), c.name, c.type;

-- 3. Refresh Function
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_daily_overview;
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_category_performance;
END;
$$ LANGUAGE plpgsql;
