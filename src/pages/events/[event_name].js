import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiCalendar } from 'react-icons/fi';
import { FaPoundSign } from 'react-icons/fa';
import { MdOutlineConfirmationNumber } from 'react-icons/md';
import styles from '../../styles/Event.module.css';
import { useEvent } from '../../hooks/useEvent';
import { useLastDayStats } from '../../hooks/useLastDayStats';
import { supabase } from '../../lib/supabaseClient'; // Import supabase

const StatCard = ({ title, value, subtext, icon }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <h4 className={styles.cardTitle}>{title}</h4>
      <span className={styles.cardIcon}>{icon}</span>
    </div>
    <p className={styles.cardValue}>{value}</p>
    <p className={styles.cardSubtext}>{subtext}</p>
  </div>
);

export default function EventDashboard() {
  const router = useRouter();
  const { event_name } = router.query;
  const [activeTab, setActiveTab] = useState('Stats');
  const [occupancy, setOccupancy] = useState(0);
  const [ticketsRemaining, setTicketsRemaining] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(0);

  const { data: eventData, error: eventError, isLoading: eventIsLoading } = useEvent(event_name);
  const { data: lastDayStats, error: statsError, isLoading: statsIsLoading } = useLastDayStats(event_name);

  // Fetch total capacity directly from the 'shows' table as you instructed.
  useEffect(() => {
    if (event_name) {
      const fetchCapacity = async () => {
        const { data, error } = await supabase
          .from('shows')
          .select('ticket_qty_available')
          .eq('event_name', event_name);

        if (error) {
          console.error('Error fetching capacity:', error);
        } else {
          const capacity = data.reduce((acc, show) => acc + (show.ticket_qty_available || 0), 0);
          setTotalCapacity(capacity);
        }
      };
      fetchCapacity();
    }
  }, [event_name]);

  // Perform the correct calculations in the frontend once data is ready.
  useEffect(() => {
    if (eventData && totalCapacity > 0) {
      const ticketsSold = eventData.total_tickets_sold || 0;

      // Your formula for Occupancy
      const calculatedOccupancy = (ticketsSold / totalCapacity) * 100;

      // Your formula for Tickets Remaining
      const calculatedTicketsRemaining = totalCapacity - ticketsSold;

      setOccupancy(calculatedOccupancy);
      setTicketsRemaining(calculatedTicketsRemaining);
    } else {
        // Default state if capacity is 0
        setOccupancy(0)
        setTicketsRemaining(0 - (eventData?.total_tickets_sold || 0))
    }
  }, [eventData, totalCapacity]);

  if (eventIsLoading || statsIsLoading) {
    return <div>Loading...</div>;
  }

  if (eventError || statsError) {
    return <div>Error loading data</div>;
  }

  return (
    <div>
      <h1 className={styles.header}>{event_name}</h1>
      <p className={styles.subheader}>
        A consolidated, at-a-glance dashboard for this Concert.
      </p>
      <div className={styles.tabsContainer}>
        {['Stats', 'Charts', 'AI Deep Dive'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className={styles.grid}>
          <StatCard
            title="Total Box Office"
            value={`£${Number(eventData?.total_gross_value || 0).toLocaleString()}`}
            subtext="Lifetime Total"
            icon={<FaPoundSign />}
        />
        <StatCard
            title="Total Tickets Sold"
            value={eventData?.total_tickets_sold || 0}
            subtext="Lifetime Total"
            icon={<MdOutlineConfirmationNumber />}
        />
        <StatCard
            title="% Occupancy"
            value={`${occupancy.toFixed(1)}%`}
            subtext="Based on capacity"
            icon={<FiTrendingUp />}
        />
        <StatCard
            title="Overall ATP"
            value={`£${Number(eventData?.average_ticket_price || 0).toFixed(2)}`}
            subtext="Avg. Ticket Price"
            icon={<FaPoundSign />}
        />
        <StatCard
            title="Tickets Remaining"
            value={ticketsRemaining}
            subtext="Across all shows"
            icon={<FiUsers />}
        />
        <StatCard
            title="Days to Performance"
            value="124"
            subtext="Until first show"
            icon={<FiCalendar />}
        />
        <StatCard
            title="Last Day Gross"
            value={`£${lastDayStats?.gross.toLocaleString()}`}
            subtext="Yesterday's Sales"
            icon={<FaPoundSign />}
        />
        <StatCard
            title="Last Day Tickets"
            value={lastDayStats?.tickets}
            subtext="Yesterday's Sales"
            icon={<MdOutlineConfirmationNumber />}
        />
        <StatCard
            title="Last Day ATP"
            value={`£${lastDayStats?.atp.toFixed(2)}`}
            subtext="Yesterday's Sales"
            icon={<FaPoundSign />}
        />
      </div>
    </div>
  );
}
