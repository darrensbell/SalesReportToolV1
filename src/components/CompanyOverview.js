
import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import useSWR, { useSWRConfig } from 'swr';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Brush, ReferenceLine } from 'recharts';
import { FaExpand, FaCompress, FaPlus } from 'react-icons/fa';
import Modal from 'react-modal';
import styles from '@/styles/CompanyOverview.module.css';

const fetcher = (url) => fetch(url).then((res) => res.json());

Modal.setAppElement('#__next'); // Accessibility

const CustomTooltip = ({ active, payload, label, metric, xAxisMode, onSaleDates }) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
    const format = metric === 'revenue' ? (value) => `£${value.toLocaleString()}` : (value) => `${value.toLocaleString()} tickets`;
    
    let displayLabel = label;
    if (xAxisMode === 'normalized') {
      displayLabel = `Day ${label}`;
    }

    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{displayLabel}</p>
        {sortedPayload.map((p, i) => {
            // dataKey might be "Series Name - revenue" or "Series Name - revenue_avg"
            const seriesName = p.dataKey.split(' - ')[0];
            const valueType = p.dataKey.includes('_avg') ? ' (Avg)' : '';
            return (
                <p key={i} className={styles.tooltipValue} style={{ color: p.color }}>
                    {`${seriesName}${valueType}: ${format(p.value)}`}
                </p>
            )
        })}
      </div>
    );
  }
  return null;
};

const AnnotationLabel = ({ viewBox, value, description }) => {
    const { x, y } = viewBox;
    return (
        <foreignObject x={x - 12} y={y - 12} width="24" height="24">
            <div title={description} className={styles.annotationMarker}>!</div>
        </foreignObject>
    );
};


const COLORS = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];

export default function CompanyOverview() {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  // State for new features
  const [isFocusMode, setFocusMode] = useState(false);
  const [movingAverage, setMovingAverage] = useState(0); // 0 for none, 7, 14 etc.
  const [xAxisMode, setXAxisMode] = useState('calendar'); // 'calendar' or 'normalized'
  const [isModalOpen, setModalOpen] = useState(false);
  const [annotationDate, setAnnotationDate] = useState('');
  const [annotationDesc, setAnnotationDesc] = useState('');

  // Existing state
  const [yScale, setYScale] = useState('linear');
  const [metric, setMetric] = useState('revenue');
  const [dateRange, setDateRange] = useState(180);
  const [hiddenSeries, setHiddenSeries] = useState([]);

  const { data, error, isLoading } = useSWR(`/api/company-overview?days=${dateRange}`, fetcher, { keepPreviousData: true });

  // --- Data Transformation Logic ---
  const processedData = useMemo(() => {
    if (!data?.salesTrend?.data) return [];

    let transformed = data.salesTrend.data;

    // 1. Moving Average Calculation
    if (movingAverage > 0 && data.salesTrend.eventNames) {
        const eventNames = data.salesTrend.eventNames;
        transformed = transformed.map((d, i, arr) => {
            const newRow = { ...d };
            for (const name of eventNames) {
                const key = `${name} - ${metric}`;
                const avgKey = `${key}_avg`;
                let sum = 0;
                let count = 0;
                for (let j = 0; j < movingAverage; j++) {
                    if (i - j >= 0) {
                        sum += arr[i-j][key] || 0;
                        count++;
                    }
                }
                newRow[avgKey] = count > 0 ? sum / count : 0;
            }
            return newRow;
        });
    }
    
    // 2. X-Axis Normalization
    if (xAxisMode === 'normalized') {
      if (!data.salesTrend.onSaleDates || !data.salesTrend.eventNames) return [];
      const normalized = {};
      const onSaleMap = new Map(data.salesTrend.onSaleDates.map(d => [d.name, d.date]));

      transformed.forEach(row => {
          for (const name of data.salesTrend.eventNames) {
              const onSaleDate = onSaleMap.get(name);
              if (!onSaleDate) continue;
              const dayDiff = Math.round((new Date(row.date) - new Date(onSaleDate)) / (1000 * 60 * 60 * 24));

              if (dayDiff >= 0) {
                  if (!normalized[dayDiff]) {
                      normalized[dayDiff] = { date: dayDiff };
                  }
                  const key = `${name} - ${metric}`;
                  if (row[key]) {
                      normalized[dayDiff][key] = (normalized[dayDiff][key] || 0) + row[key];
                  }
                  if (movingAverage > 0) {
                      const avgKey = `${key}_avg`;
                      if (row[avgKey]) {
                          normalized[dayDiff][avgKey] = (normalized[dayDiff][avgKey] || 0) + row[avgKey];
                      }
                  }
              }
          }
      });
      transformed = Object.values(normalized).sort((a,b) => a.date - b.date);
    }

    return transformed;
  }, [data, metric, movingAverage, xAxisMode]);

  // --- Event Handlers ---
  const handleLegendClick = (e) => {
    const { dataKey } = e;
    const seriesName = dataKey.split(' - ')[0];
    setHiddenSeries(prev => 
      prev.includes(seriesName) ? prev.filter(s => s !== seriesName) : [...prev, seriesName]
    );
  };

  const handleAreaClick = (e) => {
      if (e && e.activeLabel && xAxisMode === 'calendar') {
          const clickedDataKey = e.activePayloads[0].payload.name;
          router.push(`/shows/${encodeURIComponent(clickedDataKey)}`);
      }
  }

  const handleAddAnnotation = async (e) => {
    e.preventDefault();
    if (!annotationDate || !annotationDesc) return;

    await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotation_date: annotationDate, description: annotationDesc }),
    });
    mutate(`/api/company-overview?days=${dateRange}`); // Re-fetch data
    setModalOpen(false);
    setAnnotationDate('');
    setAnnotationDesc('');
  };

  // --- Rendering Logic ---
  const formatYAxis = (value) => {
    if (metric === 'revenue') return `£${Number(value).toLocaleString()}`;
    return Number(value).toLocaleString();
  };

  const formatXAxis = (dateString) => {
    if (xAxisMode === 'normalized') return `Day ${dateString}`;
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const yDomain = yScale === 'log' ? [0.1, 'auto'] : [0, 'auto'];
  const visibleEventNames = data?.salesTrend?.eventNames?.filter(name => !hiddenSeries.includes(name)) || [];

  const chart = (
      <div className={`${styles.chartSection} ${styles.fullWidth}`}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>Sales Trend</h2>
            <div className={styles.controlsContainer}>
              {/* Date Range */}
              <div className={styles.controlGroup}>
                  {[30, 90, 180].map(days => (
                      <button key={days} onClick={() => setDateRange(days)} className={`${styles.toggleButton} ${dateRange === days ? styles.active : ''}`}>
                          {days}D
                      </button>
                  ))}
              </div>
              {/* Metric Toggle */}
              <div className={styles.controlGroup}>
                  <button onClick={() => setMetric('revenue')} className={`${styles.toggleButton} ${metric === 'revenue' ? styles.active : ''}`}>
                      Revenue
                  </button>
                  <button onClick={() => setMetric('tickets')} className={`${styles.toggleButton} ${metric === 'tickets' ? styles.active : ''}`}>
                      Tickets
                  </button>
              </div>
              {/* X-Axis Mode */}
              <div className={styles.controlGroup}>
                  <button onClick={() => setXAxisMode('calendar')} className={`${styles.toggleButton} ${xAxisMode === 'calendar' ? styles.active : ''}`}>
                      Calendar Date
                  </button>
                  <button onClick={() => setXAxisMode('normalized')} className={`${styles.toggleButton} ${xAxisMode === 'normalized' ? styles.active : ''}`}>
                      Days On-Sale
                  </button>
              </div>
              {/* Moving Average */}
              <div className={styles.controlGroup}>
                   <button onClick={() => setMovingAverage(0)} className={`${styles.toggleButton} ${movingAverage === 0 ? styles.active : ''}`}>
                      Daily
                  </button>
                  <button onClick={() => setMovingAverage(7)} className={`${styles.toggleButton} ${movingAverage === 7 ? styles.active : ''}`}>
                      7-Day Avg
                  </button>
                  <button onClick={() => setMovingAverage(14)} className={`${styles.toggleButton} ${movingAverage === 14 ? styles.active : ''}`}>
                      14-Day Avg
                  </button>
              </div>
            </div>
          </div>
          <div className={styles.headerActions}>
              <button onClick={() => setModalOpen(true)} className={styles.actionButton} title="Add Annotation"><FaPlus /></button>
              <button onClick={() => setYScale(yScale === 'linear' ? 'log' : 'linear')} className={styles.actionButton} title={`Use ${yScale === 'linear' ? 'Log' : 'Linear'} Scale`}>
                {yScale === 'linear' ? 'LOG' : 'LIN'}
              </button>
              <button onClick={() => setFocusMode(!isFocusMode)} className={styles.actionButton} title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}>
                  {isFocusMode ? <FaCompress /> : <FaExpand />}
              </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={isFocusMode ? window.innerHeight - 200 : 500}>
          <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 20, bottom: 80 }} onClick={handleAreaClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" />
            <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={formatXAxis} angle={isFocusMode ? 0 : -45} textAnchor={isFocusMode ? 'middle' : 'end'} height={60} interval="preserveStartEnd"/>
            <YAxis stroke="#94a3b8" tickFormatter={formatYAxis} scale={yScale} domain={yDomain} allowDataOverflow={true} />
            <Tooltip content={<CustomTooltip metric={metric} xAxisMode={xAxisMode} onSaleDates={data?.salesTrend?.onSaleDates}/>} wrapperStyle={{ outline: 'none' }} />
            <Legend wrapperStyle={{ bottom: 0, paddingTop: '20px' }} onClick={handleLegendClick} />
            
            {/* On-Sale Date Lines (only in calendar mode) */}
            {xAxisMode === 'calendar' && data?.salesTrend?.onSaleDates && data.salesTrend.onSaleDates.map((item, i) => (
              !hiddenSeries.includes(item.name) && (
                <ReferenceLine 
                    key={`ref-${i}`} 
                    x={item.date} 
                    stroke="#fafafa" 
                    strokeDasharray="4 4" 
                    label={<div/>}
                />
              )
            ))}

            {/* Annotation Lines (only in calendar mode) */}
            {xAxisMode === 'calendar' && data?.salesTrend?.annotations && data.salesTrend.annotations.map((item, i) => (
                <ReferenceLine 
                    key={`anno-${i}`} 
                    x={item.annotation_date}
                    stroke="#fef08a" 
                    strokeWidth={2}
                    label={<AnnotationLabel description={`${item.annotation_date}: ${item.description}`} />}
                />
            ))}

            {/* Data Series Areas */}
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
                hide={movingAverage > 0} // Hide raw data if showing average
              />
            ))}

             {/* Moving Average Lines */}
             {movingAverage > 0 && visibleEventNames.map((name, i) => (
              <Area 
                key={`${name}_avg`}
                type="monotone" 
                dataKey={`${name} - ${metric}_avg`}
                stackId="2" // Use a different stackId to prevent stacking with raw data
                stroke={COLORS[i % COLORS.length]} 
                fill={COLORS[i % COLORS.length]} 
                fillOpacity={0.4}
                name={`${name} (Avg)`}
              />
            ))}

            {data && <Brush dataKey="date" height={30} stroke="#8884d8" fill="#1a1a2e" travellerWidth={20} tickFormatter={formatXAxis} y={isFocusMode ? window.innerHeight - 250 : 420}/>}
          </AreaChart>
        </ResponsiveContainer>
        {isLoading && <div className={styles.loadingOverlay}>Loading...</div>}
      </div>
  );

  return (
    <div className={`${styles.overviewContainer} ${isFocusMode ? styles.focusMode : ''}`}>
      {!isFocusMode && (
          <h1 className={styles.overviewTitle}>Company Overview</h1>
      )}
      <div className={isFocusMode ? styles.focusGrid : styles.grid}>
          {chart}
          {!isFocusMode && (
              <>
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
                        {data?.eventSummary && data.eventSummary.map((event, index) => (
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
            </>
          )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setModalOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>Add New Annotation</h2>
        <form onSubmit={handleAddAnnotation}>
          <div className={styles.formGroup}>
            <label htmlFor="annotation-date">Date</label>
            <input type="date" id="annotation-date" value={annotationDate} onChange={e => setAnnotationDate(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="annotation-desc">Description</label>
            <textarea id="annotation-desc" value={annotationDesc} onChange={e => setAnnotationDesc(e.target.value)} required />
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={() => setModalOpen(false)} className={styles.cancelButton}>Cancel</button>
            <button type="submit" className={styles.submitButton}>Add Annotation</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
