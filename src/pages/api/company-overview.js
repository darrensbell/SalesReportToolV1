import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { days = 180 } = req.query;
    const dateRange = parseInt(days, 10);
    const date = new Date();
    date.setDate(date.getDate() - dateRange);
    const dateString = date.toISOString().split('T')[0];

    // --- Parallel Data Fetching for efficiency ---
    const [
        { data: eventSummaryData, error: eventSummaryError },
        { data: salesTrendData, error: salesTrendError },
        { data: annotationsData, error: annotationsError }
    ] = await Promise.all([
        supabase.from('event_summary').select('event_name, total_gross_value, total_tickets_sold'),
        supabase.from('subtotal_by_event_date_showtime').select('transaction_date, event_name, show_time, total_gross_value, total_tickets_sold').gte('transaction_date', dateString),
        supabase.from('chart_annotations').select('annotation_date, description').gte('annotation_date', dateString)
    ]);

    // --- Error Handling Strategy ---
    // 1. Critical data (sales, events) MUST be present. If they fail, the entire request fails.
    if (eventSummaryError) throw new Error(`Failed to fetch event summary: ${eventSummaryError.message}`);
    if (salesTrendError) throw new Error(`Failed to fetch sales trends: ${salesTrendError.message}`);
    
    // 2. Non-critical data (annotations) can fail gracefully. Log the error but continue.
    if (annotationsError) {
        console.error('API Warning: Failed to fetch chart annotations. Proceeding without them.', annotationsError);
    }

    // --- Data Processing ---
    const eventSummary = (eventSummaryData || []).map(event => ({
      name: event.event_name,
      totalGross: event.total_gross_value,
      totalTickets: event.total_tickets_sold,
    }));

    const topEvents = [...eventSummary]
      .sort((a, b) => b.totalGross - a.totalGross)
      .slice(0, 5);

    const salesByDate = {};
    const onSaleDates = {};
    const uniqueSeriesNames = new Set();

    (salesTrendData || []).forEach(sale => {
      const seriesName = `${sale.event_name} - ${sale.show_time}`;
      uniqueSeriesNames.add(seriesName);
      const saleDate = sale.transaction_date.split('T')[0];
      if (!onSaleDates[seriesName] || new Date(saleDate) < new Date(onSaleDates[seriesName])) {
        onSaleDates[seriesName] = saleDate;
      }
    });
    
    const eventNames = Array.from(uniqueSeriesNames);

    (salesTrendData || []).forEach(sale => {
      const date = sale.transaction_date.split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { date };
        eventNames.forEach(name => {
          salesByDate[date][`${name} - revenue`] = 0;
          salesByDate[date][`${name} - tickets`] = 0;
        });
      }
    });

    (salesTrendData || []).forEach(sale => {
      const date = sale.transaction_date.split('T')[0];
      const seriesName = `${sale.event_name} - ${sale.show_time}`;
      salesByDate[date][`${seriesName} - revenue`] += sale.total_gross_value;
      salesByDate[date][`${seriesName} - tickets`] += sale.total_tickets_sold;
    });

    const sortedSalesTrend = Object.values(salesByDate).sort((a, b) => new Date(a.date) - new Date(b.date));

    // --- Send Response ---
    res.status(200).json({
      eventSummary,
      topEvents,
      salesTrend: {
        data: sortedSalesTrend,
        eventNames: eventNames,
        onSaleDates: Object.entries(onSaleDates).map(([name, date]) => ({ name, date })),
        // Use the fetched annotations, or a guaranteed empty array if the fetch failed.
        annotations: annotationsData || [],
      },
    });

  } catch (error) {
    // This will catch the critical errors from eventSummary and salesTrend
    console.error('Critical Error in /api/company-overview:', error);
    res.status(500).json({ error: 'Failed to load critical dashboard data.', details: error.message });
  }
}
