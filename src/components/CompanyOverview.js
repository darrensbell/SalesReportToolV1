import { useState } from 'react';
import useSWR from 'swr';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Brush, ReferenceLine } from 'recharts';
import styles from '@/styles/CompanyOverview.module.css';

const fetcher = (url) => fetch(url).then((res) => res.json());

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Sort payload to show largest values first
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {sortedPayload.map((p, i) => (
            <p key={i} className={styles.tooltipValue} style={{ color: p.color }}>
                {`${p.name}: £${p.value.toLocaleString()}`}
            </p>
        ))}
      </div>
    );
  }
  return null;
};

const ReferenceLabel = ({ value, viewBox, label }) => {
    const { x, y, width, height } = viewBox;
    return (
        <text x={x} y={y - 20} fill="#fff" textAnchor="middle" dominantBaseline="middle" transform={`rotate(-90 ${x} ${y})`}>
            <tspan className={styles.referenceLabel}>{label} On Sale</tspan>
        </text>
    );
};


const COLORS = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];

export default function CompanyOverview() {
  const { data, error, isLoading } = useSWR('/api/company-overview', fetcher);
  const [yScale, setYScale] = useState('linear');

  if (isLoading) return <div className={styles.loading}>Loading Company Overview...</div>;
  if (error) return <div className={styles.error}>Failed to load company overview: {error.message}</div>;
  if (data && data.error) return <div className={styles.error}>Failed to load company overview: {data.error}</div>;
  if (!data || !data.salesTrend || !data.salesTrend.data) return <div className={styles.loading}>Loading...</div>;

  const formatCurrency = (value) => `£${Number(value).toLocaleString()}`;
  const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  // Handle log scale with zero values
  const yDomain = yScale === 'log' ? [0.1, 'auto'] : [0, 'auto'];

  return (
    <div className={styles.overviewContainer}>
      <h1 className={styles.overviewTitle}>Company Overview</h1>
      <div className={styles.grid}>
        
        <div className={`${styles.chartSection} ${styles.fullWidth}`}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Sales Trend (Last 180 Days)</h2>
            <button onClick={() => setYScale(yScale === 'linear' ? 'log' : 'linear')} className={styles.toggleButton}>
              Switch to {yScale === 'linear' ? 'Logarithmic' : 'Linear'} Scale
            </button>
          </div>
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={data.salesTrend.data} margin={{ top: 10, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" />
              <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={formatDate} angle={-45} textAnchor="end" height={60} interval="preserveStartEnd"/>
              <YAxis 
                stroke="#94a3b8" 
                tickFormatter={formatCurrency} 
                scale={yScale}
                domain={yDomain}
                allowDataOverflow={true}
              />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
              <Legend wrapperStyle={{ bottom: 0, paddingTop: '20px' }}/>
              {data.salesTrend.onSaleDates.map((item, i) => (
                <ReferenceLine 
                    key={`ref-${i}`} 
                    x={item.date} 
                    stroke="#fafafa" 
                    strokeDasharray="4 4" 
                    label={<ReferenceLabel label={item.name.split(' - ')[0]} value={item.date}/>}
                />
              ))}
              {data.salesTrend.eventNames.map((name, i) => (
                <Area key={name} type="monotone" dataKey={name} stackId="1" stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.7} name={name} />
              ))}
              <Brush dataKey="date" height={30} stroke="#8884d8" fill="#1a1a2e" travellerWidth={20} tickFormatter={formatDate} y={420}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartSection}>
          <h2 className={styles.chartTitle}>Top 5 Events by Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topEvents} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" horizontal={false} />
              <XAxis type="number" hide tickFormatter={formatCurrency} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" width={150} stroke="#94a3b8" tick={{ fill: '#e2e8f0' }} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(136, 132, 216, 0.2)'}} wrapperStyle={{ outline: 'none' }}/>
              <Bar dataKey="totalGross" name="Total Gross" fill="#82ca9d" background={{ fill: 'rgba(226, 232, 240, 0.05)' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`${styles.chartSection} ${styles.tableSection}`}>
          <h2 className={styles.chartTitle}>Event Summary</h2>
          <div className={styles.tableContainer}>
            <table className={styles.summaryTable}>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Total Gross</th>
                  <th>Total Tickets</th>
                </tr>
              </thead>
              <tbody>
                {data.eventSummary.map((event, index) => (
                  <tr key={index}>
                    <td>{event.name}</td>
                    <td>{formatCurrency(event.totalGross)}</td>
                    <td>{event.totalTickets.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}