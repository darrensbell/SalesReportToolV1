
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function EventReport() {
  const router = useRouter();
  const { event_name } = router.query;
  const [summary, setSummary] = useState(null);
  const [showtimeDetails, setShowtimeDetails] = useState([]);

  useEffect(() => {
    if (event_name) {
      async function fetchEventData() {
        const { data: summaryData, error: summaryError } = await supabase
          .from('event_summary')
          .select('*')
          .eq('event_name', event_name)
          .single();
        
        if (summaryError) {
          console.error('Error fetching event summary:', summaryError);
        } else {
          setSummary(summaryData);
        }

        const { data: showtimeData, error: showtimeError } = await supabase
          .from('event_summary_by_showtime')
          .select('*')
          .eq('event_name', event_name);

        if (showtimeError) {
          console.error('Error fetching showtime details:', showtimeError);
        } else {
          setShowtimeDetails(showtimeData);
        }
      }

      fetchEventData();
    }
  }, [event_name]);

  if (!summary) {
    return <div>Loading...</div>;
  }

  return (
    <div>
        <Link href="/">
            <button className="home-button">Home</button>
        </Link>
      <h1>{summary.event_name}</h1>
      <div className="summary-card">
          <div>
              <h4>Total Tickets Sold</h4>
              <p>{summary.total_tickets_sold}</p>
          </div>
          <div>
              <h4>Total Comp Tickets</h4>
              <p>{summary.total_comp_tickets}</p>
          </div>
          <div>
              <h4>Total Gross Value</h4>
              <p>£{Number(summary.total_gross_value).toLocaleString()}</p>
          </div>
          <div>
              <h4>Average Ticket Price</h4>
              <p>£{Number(summary.average_ticket_price).toFixed(2)}</p>
          </div>
      </div>

      <h2>Showtime Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Show Time</th>
            <th>Total Tickets Sold</th>
            <th>Total Comp Tickets</th>
            <th>Total Gross Value</th>
            <th>Average Ticket Price</th>
          </tr>
        </thead>
        <tbody>
          {showtimeDetails.map((show) => (
            <tr key={show.show_time}>
              <td>{show.show_time}</td>
              <td>{show.total_tickets_sold}</td>
              <td>{show.total_comp_tickets}</td>
              <td>£{Number(show.total_gross_value).toLocaleString()}</td>
              <td>£{Number(show.average_ticket_price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        .home-button {
            margin-bottom: 20px;
            padding: 10px 20px;
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .home-button:hover {
            background-color: #005bb5;
        }
        .summary-card {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-block: 1rem;
            padding: 1rem;
            border-radius: 8px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
        }
        .summary-card h4 {
            margin: 0 0 0.5rem 0;
        }
        .summary-card p {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        th {
          background-color: #f2f2f2;
          text-align: left;
        }
      `}</style>
    </div>
  );
}
