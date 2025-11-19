// src/services/sales.js
import { supabase } from '../lib/supabaseClient';

// ASSUMPTION: This code assumes a table named 'sales_data' with the following columns:
// - gross_amount: a number representing the sale amount
// - tickets_sold: a number representing the number of tickets sold
// - sale_date: a date string in 'YYYY-MM-DD' format

export async function getSalesStats() {
  const { data, error } = await supabase
    .from('sales_data')
    .select('gross_amount, tickets_sold, sale_date');

  if (error) {
    console.error('Error fetching sales data:', error);
    return {
      totalSales: { gross: 0, sold: 0 },
      yesterdaySales: { gross: 0, sold: 0 },
    };
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDateString = yesterday.toISOString().split('T')[0];

  const totalSales = data.reduce(
    (acc, sale) => {
      acc.gross += sale.gross_amount;
      acc.sold += sale.tickets_sold;
      return acc;
    },
    { gross: 0, sold: 0 }
  );

  const yesterdaySales = data
    .filter(sale => sale.sale_date === yesterdayDateString)
    .reduce(
      (acc, sale) => {
        acc.gross += sale.gross_amount;
        acc.sold += sale.tickets_sold;
        return acc;
      },
      { gross: 0, sold: 0 }
    );

  return { totalSales, yesterdaySales };
}
