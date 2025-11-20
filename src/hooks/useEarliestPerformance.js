import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useEarliestPerformance(eventName) {
  const [days, setDays] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarliestPerformance = async () => {
      if (!eventName) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sales')
          .select('performance_date')
          .eq('event_name', eventName)
          .order('performance_date', { ascending: true })
          .limit(1);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const earliestDate = new Date(data[0].performance_date);
          const today = new Date();
          // To calculate the difference in days, we ignore the time part of the dates
          const utcEarliest = Date.UTC(earliestDate.getFullYear(), earliestDate.getMonth(), earliestDate.getDate());
          const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
          
          const diffDays = Math.floor((utcEarliest - utcToday) / (1000 * 60 * 60 * 24));
          setDays(diffDays);
        } else {
          setDays(null); // Or some other indicator that no date was found
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarliestPerformance();
  }, [eventName]);

  return { days, isLoading, error };
}
