import useSWR from 'swr';
import { supabase } from '../lib/supabaseClient';

const fetcher = async (url, eventName) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const todayISO = today.toISOString();
  const yesterdayISO = yesterday.toISOString();

  const { data, error } = await supabase
    .from('sales')
    .select('sold_gross_value, sold_tickets')
    .eq('event_name', eventName)
    .gte('transaction_date', yesterdayISO)
    .lt('transaction_date', todayISO);

  if (error) {
    throw new Error(error.message);
  }

  const gross = data.reduce((acc, cur) => acc + cur.sold_gross_value, 0);
  const tickets = data.reduce((acc, cur) => acc + cur.sold_tickets, 0);
  const atp = tickets > 0 ? gross / tickets : 0;

  return { gross, tickets, atp };
};

export function useLastDayStats(eventName) {
  const { data, error, isLoading } = useSWR(
    eventName ? ['/api/sales/last-day', eventName] : null,
    () => fetcher('/api/sales/last-day', eventName)
  );

  return { data, error, isLoading };
}
