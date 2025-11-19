import { useEffect, useState } from 'react';
import { getSalesStats } from '../services/sales';
import styles from '../styles/SalesStats.module.css';

export default function SalesStats() {
  const [stats, setStats] = useState({
    totalSales: { gross: 0, sold: 0 },
    yesterdaySales: { gross: 0, sold: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const salesData = await getSalesStats();
        setStats(salesData);
      } catch (err) {
        setError('Failed to fetch sales data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const formatGross = (gross) => {
    if (gross >= 1000) {
      return `£${(gross / 1000).toFixed(0)}k`;
    }
    return `£${gross}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.salesSummary}>
      <div className={styles.salesBlock}>
        <h3 className={styles.salesBlockTitle}>Total Sales</h3>
        <div className={styles.salesRow}>
          <div className={styles.salesMetric}>
            <span className={styles.salesLabel}>Gross:</span>
            <span className={styles.salesValue}>{formatGross(stats.totalSales.gross)}</span>
          </div>
          <div className={styles.salesMetric}>
            <span className={styles.salesLabel}>Tickets Sold:</span>
            <span className={styles.salesValue}>{stats.totalSales.sold}</span>
          </div>
        </div>
      </div>
      <div className={styles.salesBlock}>
        <h3 className={styles.salesBlockTitle}>Yesterday's Sales</h3>
        <div className={styles.salesRow}>
          <div className={styles.salesMetric}>
            <span className={styles.salesLabel}>Gross:</span>
            <span className={styles.salesValue}>{formatGross(stats.yesterdaySales.gross)}</span>
          </div>
          <div className={styles.salesMetric}>
            <span className={styles.salesLabel}>Tickets Sold:</span>
            <span className={styles.salesValue}>{stats.yesterdaySales.sold}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
