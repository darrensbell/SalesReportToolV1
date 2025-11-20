CREATE OR REPLACE VIEW dbce_sales.last_7_days_sales AS
SELECT *
FROM dbce_sales.sales
WHERE transaction_date >= (CURRENT_DATE - INTERVAL '7 days');