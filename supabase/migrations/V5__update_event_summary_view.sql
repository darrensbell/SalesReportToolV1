CREATE OR REPLACE VIEW public.event_summary AS
SELECT
    s_agg.event_name,
    -- Get the venue name from the shows table, assuming one venue per event.
    (SELECT venue_name FROM dbce_sales.shows WHERE event_name = s_agg.event_name LIMIT 1) AS venue_name,
    s_agg.total_tickets_sold,
    s_agg.total_gross_value,
    -- Calculate Average Ticket Price
    CASE
        WHEN s_agg.total_tickets_sold > 0 THEN s_agg.total_gross_value / s_agg.total_tickets_sold
        ELSE 0
    END AS average_ticket_price,
    c_agg.total_capacity,
    -- Calculate Occupancy as per your formula: (total tickets sold / total capacity) * 100
    CASE
        WHEN c_agg.total_capacity > 0 THEN (s_agg.total_tickets_sold::decimal * 100.0) / c_agg.total_capacity
        ELSE 0
    END AS total_occupancy,
    -- Calculate Tickets Remaining as per your formula: total capacity - total tickets sold
    c_agg.total_capacity - s_agg.total_tickets_sold AS tickets_remaining
FROM
    -- 1. Aggregate sales data from the sales table
    (
        SELECT
            event_name,
            SUM(sold_tickets) AS total_tickets_sold,
            SUM(sold_gross_value) AS total_gross_value
        FROM
            dbce_sales.sales
        GROUP BY
            event_name
    ) AS s_agg
-- 2. Join with aggregated capacity data from the shows table
JOIN
    (
        SELECT
            event_name,
            SUM(ticket_qty_available) AS total_capacity
        FROM
            dbce_sales.shows
        GROUP BY
            event_name
    ) AS c_agg ON s_agg.event_name = c_agg.event_name;
