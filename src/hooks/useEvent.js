import useSWR from 'swr';
import { supabase } from '../lib/supabaseClient';

const fetcher = async (url, eventName) => {
  const { data, error } = await supabase
    .from('event_summary')
    .select('*')
    .eq('event_name', eventName)
    .single(); // Use .single() to get a single record

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export function useEvent(eventName) {
  const { data, error, isLoading } = useSWR(
    eventName ? ['/api/events', eventName] : null,
    () => fetcher('/api/events', eventName)
  );

  return { data, error, isLoading };
}
