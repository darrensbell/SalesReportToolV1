// src/services/sales.js
import { supabase } from '../lib/supabaseClient';

export async function getSalesStats() {
  // Fetch total sales from the event_summary view
  const { data: totalData, error: totalError } = await supabase
    .from('event_summary')
    .select('total_gross_value, total_tickets_sold');

  if (totalError) {
    console.error('Error fetching total sales data:', totalError);
  }

  const totalSales = totalData
    ? totalData.reduce(
        (acc, summary) => {
          acc.gross += summary.total_gross_value;
          acc.sold += summary.total_tickets_sold;
          return acc;
        },
        { gross: 0, sold: 0 }
      )
    : { gross: 0, sold: 0 };

  // Fetch yesterday's sales from the sales_yesterday view
  const { data: yesterdayData, error: yesterdayError } = await supabase
    .from('sales_yesterday')
    .select('sold_gross_value, sold_tickets');

  if (yesterdayError) {
    console.error("Error fetching yesterday's sales data:", yesterdayError);
  }

  const yesterdaySales = yesterdayData
    ? yesterdayData.reduce(
        (acc, sale) => {
          acc.gross += sale.sold_gross_value;
          acc.sold += sale.sold_tickets;
          return acc;
        },
        { gross: 0, sold: 0 }
      )
    : { gross: 0, sold: 0 };

  return { totalSales, yesterdaySales };
}
