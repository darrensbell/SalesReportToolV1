import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  // 1. Handle POST request to create a new annotation
  if (req.method === 'POST') {
    try {
      const { annotation_date, description } = req.body;

      if (!annotation_date || !description) {
        return res.status(400).json({ error: 'Date and description are required' });
      }

      const { data, error } = await supabase
        .from('chart_annotations')
        .insert([{ annotation_date, description }])
        .select();

      if (error) throw error;

      res.status(201).json(data[0]);
    } catch (error) {
      console.error('Error creating annotation:', error);
      res.status(500).json({ error: error.message });
    }
  }
  // 2. Handle GET request to fetch all annotations
  else if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('chart_annotations')
        .select('*')
        .order('annotation_date', { ascending: true });

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching annotations:', error);
      res.status(500).json({ error: error.message });
    }
  }
  // 3. Handle other methods
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
