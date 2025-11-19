import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import styles from '../../styles/Event.module.css'
import StatsTab from '../../components/StatsTab'
import ChartsTab from '../../components/ChartsTab'
import AiDeepDiveTab from '../../components/AiDeepDiveTab'
import {
  getDailySalesData,
  getPerformanceComparisonData,
  getSalesByPriceTierData,
  getAverageTicketPriceData,
} from '../../lib/chartData'

export default function EventDashboard() {
  const router = useRouter()
  const { event_name } = router.query
  const [eventData, setEventData] = useState(null)
  const [showData, setShowData] = useState(null)
  const [lastDayStats, setLastDayStats] = useState({
    gross: 0,
    tickets: 0,
    atp: 0,
  })
  const [activeTab, setActiveTab] = useState('Stats')
  const [chartData, setChartData] = useState({
    dailySales: [],
    performanceComparison: [],
    salesByPriceTier: [],
    averageTicketPrice: [],
  })

  useEffect(() => {
    if (!event_name) return

    async function fetchEventData() {
      const { data, error } = await supabase
        .from('event_summary')
        .select('*')
        .eq('event_name', event_name)
        .single()

      if (error) {
        console.error('Error fetching event data:', error)
      } else {
        setEventData(data)
      }
    }

    async function fetchShowData() {
      const { data, error } = await supabase
        .from('shows')
        .select('ticket_qty_available')
        .eq('event_name', event_name)

      if (error) {
        console.error('Error fetching show data:', error)
      } else if (data) {
        const totalCapacity = data.reduce((acc, cur) => acc + cur.ticket_qty_available, 0)
        setShowData({ ticket_qty_available: totalCapacity })
      }
    }

    async function fetchLastDaySales() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)

      const todayISO = today.toISOString()
      const yesterdayISO = yesterday.toISOString()

      const { data, error } = await supabase
        .from('sales')
        .select('sold_gross_value, sold_tickets')
        .eq('event_name', event_name)
        .gte('transaction_date', yesterdayISO)
        .lt('transaction_date', todayISO)

      if (error) {
        console.error('Error fetching last day sales:', error)
      } else {
        const gross = data.reduce((acc, cur) => acc + cur.sold_gross_value, 0)
        const tickets = data.reduce((acc, cur) => acc + cur.sold_tickets, 0)
        const atp = tickets > 0 ? gross / tickets : 0
        setLastDayStats({ gross, tickets, atp })
      }
    }

    async function fetchChartData() {
      try {
        const [dailySales, performanceComparison, salesByPriceTier, averageTicketPrice] = await Promise.all([
          getDailySalesData(event_name),
          getPerformanceComparisonData(event_name),
          getSalesByPriceTierData(event_name),
          getAverageTicketPriceData(event_name),
        ])
        setChartData({ dailySales, performanceComparison, salesByPriceTier, averageTicketPrice })
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
    }

    fetchEventData()
    fetchShowData()
    fetchLastDaySales()
    fetchChartData()
  }, [event_name])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Stats':
        return <StatsTab eventData={eventData} showData={showData} lastDayStats={lastDayStats} />
      case 'Charts':
        return <ChartsTab eventName={event_name} chartData={chartData} />
      case 'AI Deep Dive':
        return <AiDeepDiveTab />
      default:
        return null
    }
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
      <div className={styles.tabContent}>
        {renderTabContent()}
      </div>
    </div>
  )
}
