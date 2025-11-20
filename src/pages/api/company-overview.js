import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { days = 180 } = req.query;
    const dateRange = parseInt(days, 10);

    // --- 1. Fetch Core Data (remains the same) ---
    const { data: eventSummaryData, error: eventSummaryError } = await supabase
      .from('event_summary')
      .select('event_name, total_gross_value, total_tickets_sold');

    if (eventSummaryError) throw eventSummaryError;

    // --- 2. Fetch Sales Trend Data (Now with dynamic date range and both metrics) ---
    const date = new Date();
    date.setDate(date.getDate() - dateRange);
    const dateString = date.toISOString().split('T')[0];

    const { data: salesTrendData, error: salesTrendError } = await supabase
      .from('subtotal_by_event_date_showtime')
      .select('transaction_date, event_name, show_time, total_gross_value, total_tickets_sold') // Added total_tickets_sold
      .gte('transaction_date', dateString);

    if (salesTrendError) throw salesTrendError;

    // --- 3. Process Data for Charts ---
    const eventSummary = eventSummaryData.map(event => ({
      name: event.event_name,
      totalGross: event.total_gross_value,
      totalTickets: event.total_tickets_sold,
    }));

    const topEvents = [...eventSummary]
      .sort((a, b) => b.totalGross - a.totalGross)
      .slice(0, 5);

    // --- 4. Process Advanced Sales Trend Data (for both metrics) ---
    const salesByDate = {};
    const onSaleDates = {};
    const uniqueSeriesNames = new Set();

    salesTrendData.forEach(sale => {
      const seriesName = `${sale.event_name} - ${sale.show_time}`;
      uniqueSeriesNames.add(seriesName);
      const saleDate = sale.transaction_date.split('T')[0];
      if (!onSaleDates[seriesName] || new Date(saleDate) < new Date(onSaleDates[seriesName])) {
        onSaleDates[seriesName] = saleDate;
      }
    });
    
    const eventNames = Array.from(uniqueSeriesNames);

    // Initialize the date structure
    salesTrendData.forEach(sale => {
      const date = sale.transaction_date.split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { date };
        eventNames.forEach(name => {
          salesByDate[date][`${name} - revenue`] = 0;
          salesByDate[date][`${name} - tickets`] = 0;
        });
      }
    });

    // Populate the structure with actual sales data
    salesTrendData.forEach(sale => {
      const date = sale.transaction_date.split('T')[0];
      const seriesName = `${sale.event_name} - ${sale.show_time}`;
      salesByDate[date][`${seriesName} - revenue`] += sale.total_gross_value;
      salesByDate[date][`${seriesName} - tickets`] += sale.total_tickets_sold;
    });

    const sortedSalesTrend = Object.values(salesByDate).sort((a, b) => new Date(a.date) - new Date(b.date));

    // --- 5. Send Response ---
    res.status(200).json({
      eventSummary,
      topEvents,
      salesTrend: {
        data: sortedSalesTrend,
        eventNames: eventNames,
        onSaleDates: Object.entries(onSaleDates).map(([name, date]) => ({ name, date })),
      },
    });

  } catch (error) {
    console.error('Error in /api/company-overview:', error);
    res.status(500).json({ error: error.message });
  }
}
