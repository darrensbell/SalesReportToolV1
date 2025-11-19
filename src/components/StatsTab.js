import { FiTrendingUp, FiUsers, FiCalendar } from 'react-icons/fi'
import { FaPoundSign } from 'react-icons/fa'
import { MdOutlineConfirmationNumber } from 'react-icons/md'
import styles from '../styles/Event.module.css'

const StatCard = ({ title, value, subtext, icon }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <h4 className={styles.cardTitle}>{title}</h4>
      <span className={styles.cardIcon}>{icon}</span>
    </div>
    <p className={styles.cardValue}>{value}</p>
    <p className={styles.cardSubtext}>{subtext}</p>
  </div>
)

export default function StatsTab({ eventData, showData, lastDayStats }) {
  if (!eventData || !showData) {
    return <div>Loading...</div>
  }

  const occupancy = showData.ticket_qty_available > 0
    ? (eventData.total_tickets_sold / showData.ticket_qty_available) * 100
    : 0

  return (
    <div className={styles.grid}>
      <StatCard
        title="Total Box Office"
        value={`£${Number(eventData.total_gross_value).toLocaleString()}`}
        subtext="Lifetime Total"
        icon={<FaPoundSign />}
      />
      <StatCard
        title="Total Tickets Sold"
        value={eventData.total_tickets_sold.toLocaleString('en-GB')}
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
        value={`£${Number(eventData.average_ticket_price).toFixed(2)}`}
        subtext="Avg. Ticket Price"
        icon={<FaPoundSign />}
      />
      <StatCard
        title="Tickets Remaining"
        value={(showData.ticket_qty_available - eventData.total_tickets_sold).toLocaleString('en-GB')}
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
        value={`£${lastDayStats.gross.toLocaleString()}`}
        subtext="Yesterday's Sales"
        icon={<FaPoundSign />}
      />
      <StatCard
        title="Last Day Tickets"
        value={lastDayStats.tickets.toLocaleString('en-GB')}
        subtext="Yesterday's Sales"
        icon={<MdOutlineConfirmationNumber />}
      />
      <StatCard
        title="Last Day ATP"
        value={`£${lastDayStats.atp.toFixed(2)}`}
        subtext="Yesterday's Sales"
        icon={<FaPoundSign />}
      />
    </div>
  )
}
