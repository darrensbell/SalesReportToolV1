import { supabase } from './supabaseClient'

export async function getDailySalesData(eventName) {
  const { data, error } = await supabase
    .from('subtotal_by_date_event')
    .select('transaction_date, total_gross_value')
    .eq('event_name', eventName)
    .order('transaction_date', { ascending: true })

  if (error) {
    throw error
  }

  return [
    {
      id: 'Daily Gross Revenue',
      data: data.map(d => ({
        x: d.transaction_date,
        y: d.total_gross_value,
      })),
    },
  ]
}

export async function getPerformanceComparisonData(eventName) {
  const { data, error } = await supabase
    .from('event_summary_by_showtime')
    .select('show_time, total_gross_value, total_tickets_sold')
    .eq('event_name', eventName)

  if (error) {
    throw error
  }

  return data.map(d => ({
    show_time: d.show_time,
    'Total Gross Value': d.total_gross_value,
    'Total Tickets Sold': d.total_tickets_sold,
  }))
}

export async function getSalesByPriceTierData(eventName) {
  const { data, error } = await supabase
    .from('sales')
    .select('price_band_name, sold_tickets')
    .eq('event_name', eventName)

  if (error) {
    throw error
  }

  const groupedData = data.reduce((acc, d) => {
    if (!acc[d.price_band_name]) {
      acc[d.price_band_name] = { id: d.price_band_name, label: d.price_band_name, value: 0 };
    }
    acc[d.price_band_name].value += d.sold_tickets;
    return acc;
  }, {});

  return Object.values(groupedData)
}

export async function getAverageTicketPriceData(eventName) {
  const { data, error } = await supabase
    .from('sales')
    .select('atp, performance_date, transaction_date')
    .eq('event_name', eventName)

  if (error) {
    throw error
  }

  return [
    {
      id: 'Average Ticket Price',
      data: data.map(d => ({
        x: new Date(d.performance_date).getTime() - new Date(d.transaction_date).getTime(),
        y: d.atp,
      })),
    },
  ]
}
