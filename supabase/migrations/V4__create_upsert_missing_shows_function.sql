CREATE OR REPLACE FUNCTION dbce_sales.upsert_missing_shows()
RETURNS void AS $$
BEGIN
  INSERT INTO dbce_sales.shows (event_name, show_time)
  SELECT DISTINCT s.event_name, s.show_time
  FROM dbce_sales.sales AS s
  LEFT JOIN dbce_sales.shows AS sh ON s.event_name = sh.event_name AND s.show_time = sh.show_time
  WHERE sh.show_id IS NULL AND s.event_name IS NOT NULL AND s.show_time IS NOT NULL
  ON CONFLICT (event_name, show_time) DO NOTHING;
END;
$$ LANGUAGE plpgsql;