
import { useState } from 'react';
import Modal from 'react-modal';
import Papa from 'papaparse';
import { supabase } from '../lib/supabaseClient';

Modal.setAppElement('#__next');

export default function CSVImportModal({ isOpen, onRequestClose, onImport }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file to import.');
      return;
    }

    const headerMapping = {
      'Transaction Completed Date Time': 'transaction_completed_date_time',
      'Event Name': 'event_name',
      'Channel Name': 'channel_name',
      'Price Band Name': 'price_band_name',
      'Performance Date Time': 'performance_date_time',
      'Performance Start Time': 'performance_start_time',
      'Transaction Completed At': 'transaction_completed_at',
      'Sold Tickets': 'sold_tickets',
      'Comp Tickets': 'comp_tickets',
      'Sold Gross Value': 'sold_gross_value',
      'Sales ID': 'sales_id',
      'Transaction Date': 'transaction_date',
      'Performance Date': 'performance_date',
      'Show Time': 'show_time',
      'ATP': 'atp',
      'Transaction DOW': 'transaction_dow',
    };

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const mappedData = results.data.map(row => {
          const newRow = {};
          for (const key in row) {
            if (headerMapping[key.trim()]) {
              const value = row[key];
              newRow[headerMapping[key.trim()]] = value === '' ? null : value;
            }
          }
          return newRow;
        });

        const filteredData = mappedData.filter(row => Object.values(row).some(val => val !== null && val !== ''));

        if (filteredData.length > 0) {
          const { error } = await supabase.from('sales').insert(filteredData);

          if (error) {
            console.error('Error inserting data:', error);
            alert(`Error inserting data: ${error.message}`);
          } else {
            alert('Data imported successfully!');
            onImport();
            onRequestClose();
          }
        } else {
          alert('No data to import. The CSV file may be empty or the headers do not match.');
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. See console for details.');
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Import CSV"
    >
      <h2>Import CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleImport}>Import</button>
      <button onClick={onRequestClose}>Close</button>
    </Modal>
  );
}
