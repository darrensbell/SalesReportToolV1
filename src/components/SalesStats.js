import useSWR from 'swr';
import { getSalesStats } from '../services/sales';
import styles from '../styles/SalesStats.module.css';

// The fetcher function is passed to useSWR. 
// SWR gives it the key ('/api/sales-stats' in this case) as the first argument.
const fetcher = () => getSalesStats();

export default function SalesStats() {
  // useSWR returns 3 values: data, error, and isLoading.
  // We give it a unique key '/api/sales-stats' to identify the data,
  // and the fetcher function to get the data.
  const { data: stats, error, isLoading } = useSWR('/api/sales-stats', fetcher);

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `£${(amount / 1000).toFixed(0)}K`;
    } else {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
      }).format(amount);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Failed to fetch sales data</div>;
  }

  return (
    <div className={styles.salesSummary}>
      <div className={styles.salesBlock}>
        <h3 className={styles.salesBlockTitle}>Total Sales</h3>
        <div className={styles.salesRow}>
          <div className={styles.salesMetric}>
            <span className={styles.salesLabel}>Gross</span>
            <span className={styles.salesValue}>{formatCurrency(stats.totalSales.gross)}</span>
          </div>
          <div className={styles.salesMetric}>
            <span className={styles.salesLabel}>Tickets Sold</span>
            <span className={styles.ticketsSold}>{stats.totalSales.sold.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className={styles.salesBlock}>
        <h3 className={styles.salesBlockTitle}>Yesterday's Sales</h3>
        <div className={styles.salesRow}>
          <div className={styles.salesMetric}>
            <span className={styles.salesLabel}>Gross</span>
            <span className={styles.salesValue}>{formatCurrency(stats.yesterdaySales.gross)}</span>
          </div>
          <div className={styles.salesMetric}>
            <span className={styles.salesLabel}>Tickets Sold</span>
            <span className={styles.ticketsSold}>{stats.yesterdaySales.sold.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
