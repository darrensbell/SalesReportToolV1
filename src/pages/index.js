
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase.from('event_summary').select('event_name');
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        const uniqueEvents = [...new Map(data.map(item => [item['event_name'], item])).values()];
        setEvents(uniqueEvents);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div>
      <h1>Event Dashboard</h1>
      <p>Select an event to view reports.</p>
      <div className="card-container">
        {events.map((event) => (
          <Link key={event.event_name} href={`/events/${encodeURIComponent(event.event_name)}`} className="card">
              <h3>{event.event_name}</h3>
          </Link>
        ))}
      </div>
      <style jsx>{`
        .card-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 20px;
        }
        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          text-decoration: none;
          color: inherit;
          transition: box-shadow 0.3s ease;
          min-width: 200px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          cursor: pointer;
        }
        .card:hover {
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        .card h3 {
          margin: 0;
          font-size: 1.2rem;
        }
        h1 {
            margin-bottom: 0.5rem;
        }
        p {
            margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}
