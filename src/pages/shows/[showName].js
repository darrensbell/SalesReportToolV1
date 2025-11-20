import { useRouter } from 'next/router';
import styles from '@/styles/CompanyOverview.module.css';

const ShowDetail = () => {
  const router = useRouter();
  const { showName } = router.query;

  return (
    <div className={styles.overviewContainer}>
      <h1 className={styles.overviewTitle}>Drill-Down Report</h1>
      <div className={styles.chartSection} style={{ textAlign: 'center' }}>
        <h2 className={styles.chartTitle}>Detailed Report for: {decodeURIComponent(showName)}</h2>
        <p style={{ marginTop: '20px', color: '#cbd5e1' }}>
          This is the dedicated report page for {decodeURIComponent(showName)}. 
          More detailed charts and data will be added here in the future.
        </p>
      </div>
    </div>
  );
};

export default ShowDetail;
