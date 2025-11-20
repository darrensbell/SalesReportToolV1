import useSWR, { useSWRConfig } from 'swr';
import { useRouter } from 'next/router';
import { MdOutlineConfirmationNumber } from 'react-icons/md';
import styles from '@/styles/Home.module.css';
import { supabase } from '@/lib/supabaseClient';
import { fetcher as eventFetcher } from '@/hooks/useEvent';
import CompanyOverview from '@/components/CompanyOverview'; // Import the new component

const fetcher = async (url) => {
  const { data, error } = await supabase.from('event_summary').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export default function Home() {
  const { data: events, error } = useSWR('/api/events', fetcher);
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const prefetchEvent = (eventName) => {
    const key = ['/api/events', eventName];
    mutate(key, eventFetcher(key[0], key[1]), false);
  };

  const formatCurrency = (value) => `£ ${Number(value).toLocaleString()}`;
  const formatATP = (value) => `£${Number(value).toFixed(2)}`;

  if (error) return <div>Failed to load events</div>;
  if (!events) return <div>Loading...</div>;

  return (
    <div>
      <div className={styles.headerContainer}>
        <div>
          <h1 className={styles.header}>Company Overview</h1>
          <p className={styles.subheader}>
            A summary of all concert sales and event data.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {events.map((event) => (
          <div
            key={event.event_name}
            className={styles.card}
            onClick={() => router.push(`/events/${event.event_name}`)}
            onMouseEnter={() => prefetchEvent(event.event_name)}
          >
            <h3 className={styles.eventTitle}>{event.event_name}</h3>
            <p className={styles.eventSubtitle}>CONCERT</p>

            <div
              style={{ fontSize: '24px', fontWeight: 'bold', margin: '20px 0' }}
            >
              {formatCurrency(event.total_gross_value)}
            </div>

            <div className={styles.eventData}>
              <MdOutlineConfirmationNumber className={styles.eventDataIcon} />
              <span className={styles.eventValues}>
                {formatATP(event.average_ticket_price)}
              </span>
            </div>

            <button className={styles.button}>View Dashboard</button>
          </div>
        ))}
      </div>

      {/* Add the new CompanyOverview component below the grid */}
      <CompanyOverview />
    </div>
  );
}
