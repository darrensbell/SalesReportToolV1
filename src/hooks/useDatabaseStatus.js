import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useDatabaseStatus() {
  const [status, setStatus] = useState('connected'); // Default to connected

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // A simple query to check the connection
        await supabase.from('event_summary').select('event_name', { head: true, count: 'exact' });
        setStatus('connected');
      } catch (error) {
        setStatus('not connected');
      }
    };

    // Check status on mount and then every 30 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // This function can be called to manually trigger an update status
  const setUpdating = () => setStatus('updating');

  return { status, setUpdating };
}
