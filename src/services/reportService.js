
import { supabase } from '../lib/supabaseClient';

// A helper function to get the start of a given date
const getStartOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate.toISOString();
};

/**
 * Fetches all necessary data for generating a PDF report for a given event.
 * @param {string} eventName - The name of the event.
 * @returns {Promise<object>} - A promise that resolves to the consolidated report data.
 */
export const getReportData = async (eventName) => {
  if (!eventName) {
    throw new Error('Event name is required.');
  }

  // --- 1. Fetch Key Performance Indicators (KPIs) ---
  const { data: eventSummary, error: summaryError } = await supabase
    .from('event_summary')
    .select('total_tickets_sold, total_gross_value, total_capacity')
    .eq('event_name', eventName)
    .single();

  if (summaryError) throw new Error(`Failed to fetch event summary: ${summaryError.message}`);

  // --- 2. Fetch Today's Sales ---
  const todayStart = getStartOfDay(new Date());
  const { data: todaySales, error: todayError } = await supabase
    .from('sales')
    .select('sold_tickets, sold_gross_value')
    .eq('event_name', eventName)
    .gte('transaction_date', todayStart);

  if (todayError) throw new Error(`Failed to fetch today's sales: ${todayError.message}`);

  const grossToday = todaySales.reduce((sum, record) => sum + record.sold_gross_value, 0);
  const ticketsToday = todaySales.reduce((sum, record) => sum + record.sold_tickets, 0);

  // --- 3. Fetch Sales by Channel ---
  const { data: channelSales, error: channelError } = await supabase
    .rpc('get_sales_by_channel', { p_event_name: eventName });

  if (channelError) throw new Error(`Failed to fetch sales by channel: ${channelError.message}`);

  // --- 4. Fetch Last 7 Days Sales ---
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStart = getStartOfDay(sevenDaysAgo);

  const { data: last7Days, error: last7DaysError } = await supabase
    .from('sales')
    .select('transaction_date, sold_tickets, sold_gross_value')
    .eq('event_name', eventName)
    .gte('transaction_date', sevenDaysAgoStart)
    .order('transaction_date', { ascending: false });

  if (last7DaysError) throw new Error(`Failed to fetch last 7 days sales: ${last7DaysError.message}`);

  // Consolidate daily sales for the last 7 days
  const last7DaysSales = last7Days.reduce((acc, sale) => {
    const date = new Date(sale.transaction_date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, tickets: 0, gross: 0 };
    }
    acc[date].tickets += sale.sold_tickets;
    acc[date].gross += sale.sold_gross_value;
    return acc;
  }, {});

  // --- Construct the final report object ---
  const reportData = {
    eventName,
    generatedAt: new Date().toISOString(),
    totalBoxOffice: eventSummary.total_gross_value,
    occupancy: eventSummary.total_capacity > 0 ? (eventSummary.total_tickets_sold / eventSummary.total_capacity) : 0,
    grossToday,
    ticketsToday,
    atp: eventSummary.total_tickets_sold > 0 ? (eventSummary.total_gross_value / eventSummary.total_tickets_sold) : 0,
    salesByChannel: channelSales,
    last7DaysSales: Object.values(last7DaysSales),
    // NOTE: Daily Roster and Remaining AAP are not yet implemented
    // as they require more complex queries or data points not immediately available.
    // This will be added in a future step.
    dailyRoster: [], 
    remainingAap: 0, 
  };

  return reportData;
};
