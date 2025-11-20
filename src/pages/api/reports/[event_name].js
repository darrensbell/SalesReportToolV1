
import { getReportData } from '../../../services/reportService';

/**
 * API route handler for fetching report data.
 * @param {object} req - The incoming request object.
 * @param {object} res - The outgoing response object.
 */
export default async function handler(req, res) {
  const { event_name } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const reportData = await getReportData(event_name);
    return res.status(200).json(reportData);
  } catch (error) {
    console.error('Error fetching report data:', error);
    return res.status(500).json({ message: 'Internal Server Error', details: error.message });
  }
}
