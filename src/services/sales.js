// src/services/sales.js
import { supabase } from '../lib/supabaseClient';

export async function getSalesStats() {
  const { data: eventSummaryData, error: eventSummaryError } = await supabase
    .from('event_summary')
    .select('total_gross_value, total_tickets_sold');

  if (eventSummaryError) {
    console.error('Error fetching event summary data:', eventSummaryError);
  }

  const { data: salesYesterdayData, error: salesYesterdayError } = await supabase
    .from('sales_yesterday')
    .select('sold_gross_value, sold_tickets');

  if (salesYesterdayError) {
    console.error('Error fetching sales yesterday data:', salesYesterdayError);
  }

  const totalSales = eventSummaryData?.reduce(
    (acc, summary) => {
      acc.gross += summary.total_gross_value;
      acc.sold += summary.total_tickets_sold;
      return acc;
    },
    { gross: 0, sold: 0 }
  ) || { gross: 0, sold: 0 };

  const yesterdaySales = salesYesterdayData?.reduce(
    (acc, summary) => {
      acc.gross += summary.sold_gross_value;
      acc.sold += summary.sold_tickets;
      return acc;
    },
    { gross: 0, sold: 0 }
  ) || { gross: 0, sold: 0 };

  return { totalSales, yesterdaySales };
}
