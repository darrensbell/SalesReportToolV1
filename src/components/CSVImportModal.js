
import { useState } from 'react';
import Modal from 'react-modal';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabaseClient';
import styles from '@/styles/CSVImportModal.module.css';

Modal.setAppElement('#__next');

export default function CSVImportModal({ isOpen, onRequestClose, onImport }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleFileChange = (e) => {
    const chosenFile = e.target.files[0];
    if (chosenFile) {
      setFile(chosenFile);
      setFileName(chosenFile.name);
      setNotification({ message: '', type: '' });
    }
  };

  const handleImport = async () => {
    if (!file) {
      setNotification({ message: 'Please select a file to import.', type: 'error' });
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
          // Derive show_time from performance_start_time
          if (newRow.performance_start_time) {
              const hour = parseInt(newRow.performance_start_time.split(':')[0], 10);
              newRow.show_time = hour < 17 ? 'Matinee' : 'Evening';
          } else {
              newRow.show_time = null;
          }
          return newRow;
        });

        const filteredData = mappedData.filter(row => Object.values(row).some(val => val !== null && val !== ''));

        if (filteredData.length > 0) {
          // Upsert shows, filtering out any that couldn't have a show_time derived
          const showsToUpsert = filteredData
            .filter(item => item.event_name && item.show_time)
            .map(item => ({ event_name: item.event_name, show_time: item.show_time }));

          const uniqueShows = [...new Map(showsToUpsert.map(item => [`${item.event_name}-${item.show_time}`, item])).values()];

          if (uniqueShows.length > 0) {
              const { error: showsError } = await supabase.from('shows').upsert(uniqueShows, { onConflict: 'event_name,show_time' });
              if (showsError) {
                console.error('Error upserting shows:', showsError);
                setNotification({ message: `Error upserting shows: ${showsError.message}`, type: 'error' });
                return;
              }
          }

          const { error } = await supabase.from('sales').insert(filteredData);

          if (error) {
            console.error('Error inserting data:', error);
            setNotification({ message: `Error inserting data: ${error.message}`, type: 'error' });
          } else {
            setNotification({ message: 'Data imported successfully!', type: 'success' });
            onImport();
            setTimeout(() => {
              onRequestClose();
              setNotification({ message: '', type: '' });
            }, 2000);
          }
        } else {
          setNotification({ message: 'No data to import. The CSV file may be empty or the headers do not match.', type: 'error' });
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setNotification({ message: 'Error parsing CSV file. See console for details.', type: 'error' });
      }
    });
  };

  const handleClose = () => {
    setFile(null);
    setFileName('');
    setNotification({ message: '', type: '' });
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Import CSV"
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
    >
      <h2 className={styles.modalTitle}>Import CSV</h2>
      <label className={styles.fileInputLabel}>
        Choose File
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
      </label>
      {fileName && <p className={styles.fileName}>{fileName}</p>}
      
      {notification.message && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <div className={styles.buttonContainer}>
        <button
          onClick={handleImport}
          className={`${styles.button} ${styles.importButton}`}
          disabled={!file}
        > 
          Import
        </button>
        <button
          onClick={handleClose}
          className={`${styles.button} ${styles.closeButton}`}>
          Close
        </button>
      </div>
    </Modal>
  );
}
