CREATE TABLE dbce_sales.shows (
    show_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    show_time TEXT NOT NULL, -- e.g., 'Matinee', 'Evening'
    venue_name TEXT,
    venue_total_capacity INT,
    ticket_qty_available INT,
    CONSTRAINT uq_show UNIQUE (event_name, show_time)
);

CREATE INDEX idx_shows_event_name_show_time ON dbce_sales.shows (event_name, show_time);