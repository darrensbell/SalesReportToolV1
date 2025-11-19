import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'
import { FiHome } from 'react-icons/fi'
import { MdOutlineConfirmationNumber } from 'react-icons/md'
import styles from '@/styles/Home.module.css'

export default function Home() {
  const [events, setEvents] = useState([])
  const router = useRouter()

  async function fetchEvents() {
    const { data, error } = await supabase.from('event_summary').select('*')

    if (error) {
      console.error('Error fetching events:', error)
    } else {
      setEvents(data)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const formatCurrency = (value) => `£ ${Number(value).toLocaleString()}`
  const formatATP = (value) => `£${Number(value).toFixed(2)}`

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
        {/* Static Company Overview Card */}
        <div className={styles.overviewCard} onClick={() => router.push('/')}>
          <div className={styles.overviewIcon}>
            <FiHome />
          </div>
          <h2 className={styles.overviewTitle}>Company Overview</h2>
          <p className={styles.overviewSubtitle}>REPORT</p>
          <button className={styles.button}>View Dashboard</button>
        </div>

        {/* Dynamic Event Cards */}
        {events.map((event) => (
          <div
            key={event.event_name}
            className={styles.card}
            onClick={() => router.push(`/events/${event.event_name}`)}
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
    </div>
  )
}
