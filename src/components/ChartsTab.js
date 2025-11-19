import DailySalesChart from './charts/DailySalesChart'
import PerformanceComparisonChart from './charts/PerformanceComparisonChart'
import SalesByPriceTierChart from './charts/SalesByPriceTierChart'
import AverageTicketPriceChart from './charts/AverageTicketPriceChart'
import styles from '../styles/ChartsTab.module.css'

export default function ChartsTab({ eventName, chartData }) {
  if (!chartData) return <div>Loading...</div>

  return (
    <div className={styles.grid}>
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Daily Gross Revenue</h2>
        <DailySalesChart data={chartData.dailySales} />
      </div>
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Performance Type Comparison</h2>
        <PerformanceComparisonChart data={chartData.performanceComparison} />
      </div>
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Sales by Price Tier</h2>
        <SalesByPriceTierChart data={chartData.salesByPriceTier} />
      </div>
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Average Ticket Price Analysis</h2>
        <AverageTicketPriceChart data={chartData.averageTicketPrice} />
      </div>
    </div>
  )
}
