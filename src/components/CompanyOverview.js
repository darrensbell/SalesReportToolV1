import { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Brush, ReferenceLine } from 'recharts';
import styles from '@/styles/CompanyOverview.module.css';

const fetcher = (url) => fetch(url).then((res) => res.json());

const CustomTooltip = ({ active, payload, label, metric }) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
    const format = metric === 'revenue' ? (value) => `£${value.toLocaleString()}` : (value) => `${value.toLocaleString()} tickets`;
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {sortedPayload.map((p, i) => {
            const seriesName = p.dataKey.replace(` - ${metric}`, '');
            return (
                <p key={i} className={styles.tooltipValue} style={{ color: p.color }}>
                    {`${seriesName}: ${format(p.value)}`}
                </p>
            )
        })}
      </div>
    );
  }
  return null;
};

const ReferenceLabel = ({ value, viewBox, label }) => {
    const { x, y } = viewBox;
    return (
        <text x={x} y={y - 20} fill="#fff" textAnchor="middle" dominantBaseline="middle" transform={`rotate(-90 ${x} ${y})`}>
            <tspan className={styles.referenceLabel}>{label} On Sale</tspan>
        </text>
    );
};

const COLORS = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];

export default function CompanyOverview() {
  const router = useRouter();
  const [yScale, setYScale] = useState('linear');
  const [metric, setMetric] = useState('revenue'); // 'revenue' or 'tickets'
  const [dateRange, setDateRange] = useState(180);
  const [hiddenSeries, setHiddenSeries] = useState([]);

  const { data, error, isLoading } = useSWR(`/api/company-overview?days=${dateRange}`, fetcher, { keepPreviousData: true });

  const handleLegendClick = (e) => {
    const { dataKey } = e;
    setHiddenSeries(prev => 
      prev.includes(dataKey) ? prev.filter(s => s !== dataKey) : [...prev, dataKey]
    );
  };

  const handleAreaClick = (e) => {
      if (e && e.activeLabel) {
          const clickedDataKey = e.activePayloads[0].payload.name;
          router.push(`/shows/${encodeURIComponent(clickedDataKey)}`);
      }
  }
  
  const formatYAxis = (value) => {
    if (metric === 'revenue') return `£${Number(value).toLocaleString()}`;
    return Number(value).toLocaleString();
  };

  const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  const yDomain = yScale === 'log' ? [0.1, 'auto'] : [0, 'auto'];
  const visibleEventNames = data?.salesTrend?.eventNames.filter(name => !hiddenSeries.includes(name)) || [];

  return (
    <div className={styles.overviewContainer}>
      <h1 className={styles.overviewTitle}>Company Overview</h1>
      <div className={styles.grid}>
        
        <div className={`${styles.chartSection} ${styles.fullWidth}`}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Sales Trend</h2>
              <div className={styles.controlsContainer}>
                  <div className={styles.controlGroup}>
                      {[30, 90, 180].map(days => (
                          <button key={days} onClick={() => setDateRange(days)} className={`${styles.toggleButton} ${dateRange === days ? styles.active : ''}`}>
                              {days}D
                          </button>
                      ))}
                  </div>
                  <div className={styles.controlGroup}>
                      <button onClick={() => setMetric('revenue')} className={`${styles.toggleButton} ${metric === 'revenue' ? styles.active : ''}`}>
                          Revenue
                      </button>
                      <button onClick={() => setMetric('tickets')} className={`${styles.toggleButton} ${metric === 'tickets' ? styles.active : ''}`}>
                          Tickets Sold
                      </button>
                  </div>
              </div>
            </div>
            <button onClick={() => setYScale(yScale === 'linear' ? 'log' : 'linear')} className={styles.toggleButton}>
              Use {yScale === 'linear' ? 'Log' : 'Linear'} Scale
            </button>
          </div>
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={data?.salesTrend?.data} margin={{ top: 10, right: 30, left: 20, bottom: 80 }} onClick={handleAreaClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" />
              <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={formatDate} angle={-45} textAnchor="end" height={60} interval="preserveStartEnd"/>
              <YAxis stroke="#94a3b8" tickFormatter={formatYAxis} scale={yScale} domain={yDomain} allowDataOverflow={true} />
              <Tooltip content={<CustomTooltip metric={metric}/>} wrapperStyle={{ outline: 'none' }} />
              <Legend wrapperStyle={{ bottom: 0, paddingTop: '20px' }} onClick={handleLegendClick} />
              {data?.salesTrend?.onSaleDates.map((item, i) => (
                !hiddenSeries.includes(item.name) && (
                  <ReferenceLine 
                      key={`ref-${i}`} 
                      x={item.date} 
                      stroke="#fafafa" 
                      strokeDasharray="4 4" 
                      label={<ReferenceLabel label={item.name.split(' - ')[0]} value={item.date}/>}
                  />
                )
              ))}
              {visibleEventNames.map((name, i) => (
                <Area 
                  key={name}
                  type="monotone" 
                  dataKey={`${name} - ${metric}`}
                  stackId="1" 
                  stroke={COLORS[i % COLORS.length]} 
                  fill={COLORS[i % COLORS.length]} 
                  fillOpacity={0.7} 
                  name={name}
                />
              ))}
              {data && <Brush dataKey="date" height={30} stroke="#8884d8" fill="#1a1a2e" travellerWidth={20} tickFormatter={formatDate} y={420}/>}
            </AreaChart>
          </ResponsiveContainer>
          {isLoading && <div className={styles.loadingOverlay}>Loading...</div>}
        </div>

        {/* Other charts remain unchanged */}
        <div className={styles.chartSection}>
          <h2 className={styles.chartTitle}>Top 5 Events by Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.topEvents} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" horizontal={false} />
              <XAxis type="number" hide tickFormatter={formatYAxis} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" width={150} stroke="#94a3b8" tick={{ fill: '#e2e8f0' }} />
              <Tooltip content={<CustomTooltip metric='revenue' />} cursor={{fill: 'rgba(136, 132, 216, 0.2)'}} wrapperStyle={{ outline: 'none' }}/>
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
                {data?.eventSummary.map((event, index) => (
                  <tr key={index}>
                    <td>{event.name}</td>
                    <td>{`£${event.totalGross.toLocaleString()}`}</td>
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