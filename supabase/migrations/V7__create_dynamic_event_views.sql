
DO $$
DECLARE
    event_record RECORD;
    view_name TEXT;
BEGIN
    FOR event_record IN SELECT DISTINCT event_name FROM dbce_sales.shows LOOP
        -- Generate a safe, valid view name from the event_name
        -- e.g., "The Phantom of the Opera" becomes "event_view_the_phantom_of_the_opera"
        view_name := 'event_view_' || regexp_replace(lower(event_record.event_name), E'[^\w]+', '_', 'g');

        -- Create a view for the current event
        EXECUTE format(
            'CREATE OR REPLACE VIEW dbce_sales.%I AS
             SELECT *
             FROM dbce_sales.shows
             WHERE event_name = %L',
            view_name,
            event_record.event_name
        );
    END LOOP;
END $$;
