
import React from 'react';
import styles from '../styles/PDFReport.module.css';

// A simple component to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
};

/**
 * A component that renders the report in a layout suitable for PDF generation.
 * It takes the consolidated report data as a prop.
 */
const PDFReport = React.forwardRef(({ reportData }, ref) => {
  if (!reportData) return null;

  const { 
    eventName, generatedAt, totalBoxOffice, occupancy, grossToday, 
    ticketsToday, atp, salesByChannel, last7DaysSales 
  } = reportData;

  return (
    <div ref={ref} className={styles.reportContainer}>
      {/* Header */}
      <header className={styles.header}>
        <h1>TheatreTrack&copy;</h1>
        <p>Darren Bell Productions | {new Date(generatedAt).toLocaleString('en-GB')}</p>
      </header>

      {/* Title */}
      <div className={styles.titleSection}>
        <h2>{eventName}</h2>
        <p>Snapshot for {new Date(generatedAt).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* KPI Tiles */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiTile}><h4>TOTAL BOX OFFICE</h4><p>{formatCurrency(totalBoxOffice)}</p></div>
        <div className={styles.kpiTile}><h4>% OCCUPANCY</h4><p>{(occupancy * 100).toFixed(1)}%</p></div>
        <div className={styles.kpiTile}><h4>GROSS TODAY</h4><p>{formatCurrency(grossToday)}</p></div>
        <div className={styles.kpiTile}><h4>TICKETS TODAY</h4><p>{ticketsToday}</p></div>
        <div className={styles.kpiTile}><h4>ATP</h4><p>{formatCurrency(atp)}</p></div>
        <div className={styles.kpiTile}><h4>REMAINING AAP</h4><p>£0.00</p></div>
      </div>

      {/* Body Section */}
      <div className={styles.bodyGrid}>
        <div>
          <h4>SALES BY CHANNEL</h4>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Channel</th>
                <th>Tickets</th>
                <th>Gross</th>
                <th>ATP</th>
              </tr>
            </thead>
            <tbody>
              {salesByChannel?.map((channel, index) => (
                <tr key={index}>
                  <td>{channel.channel}</td>
                  <td>{channel.tickets}</td>
                  <td>{formatCurrency(channel.gross)}</td>
                  <td>{formatCurrency(channel.atp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4>LAST 7 DAYS SALES</h4>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Tickets</th>
                <th>Gross</th>
              </tr>
            </thead>
            <tbody>
              {last7DaysSales?.map((sale, index) => (
                <tr key={index}>
                  <td>{new Date(sale.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                  <td>{sale.tickets}</td>
                  <td>{formatCurrency(sale.gross)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

PDFReport.displayName = 'PDFReport';
export default PDFReport;
