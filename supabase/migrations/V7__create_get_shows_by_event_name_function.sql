CREATE OR REPLACE FUNCTION dbce_sales.get_shows_by_event_name(event_name_param TEXT)
RETURNS SETOF dbce_sales.shows AS $$
BEGIN
  RETURN QUERY SELECT * FROM dbce_sales.shows WHERE event_name = event_name_param;
END;
$$ LANGUAGE plpgsql;