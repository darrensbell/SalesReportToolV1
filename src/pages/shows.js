import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/Shows.module.css'

export default function ShowsPage() {
  const [shows, setShows] = useState([])
  const [editingShow, setEditingShow] = useState(null)
  const [notification, setNotification] = useState({ message: '', type: '' })

  async function fetchShows() {
    const { data, error } = await supabase
      .from('shows')
      .select('*')
      .order('event_name')
      .order('show_time')
    if (error) {
      console.error('Error fetching shows:', error)
      setNotification({ message: 'Error fetching shows', type: 'error' })
    } else {
      setShows(data)
    }
  }

  useEffect(() => {
    fetchShows()
  }, [])

  const handleEdit = (show) => {
    setEditingShow({ ...show })
  }

  const handleCancel = () => {
    setEditingShow(null)
  }

  const handleSave = async () => {
    const { error } = await supabase
      .from('shows')
      .update({
        venue_name: editingShow.venue_name,
        venue_total_capacity: editingShow.venue_total_capacity,
        ticket_qty_available: editingShow.ticket_qty_available,
      })
      .eq('show_id', editingShow.show_id)

    if (error) {
      console.error('Error updating show:', error)
      setNotification({ message: 'Error updating show', type: 'error' })
    } else {
      setNotification({ message: 'Show updated successfully', type: 'success' })
      setEditingShow(null)
      fetchShows()
    }
  }

  const handleSync = async () => {
    const { error } = await supabase.rpc('upsert_missing_shows')
    if (error) {
      console.error('Error syncing shows:', error)
      setNotification({
        message: `Error syncing shows: ${error.message}`,
        type: 'error',
      })
    } else {
      setNotification({
        message: 'Shows synced successfully! New shows are highlighted.',
        type: 'success',
      })
      fetchShows()
    }
  }

  const handleChange = (e, field) => {
    setEditingShow({ ...editingShow, [field]: e.target.value })
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h1 className={styles.header}>Manage Shows</h1>
        <button onClick={handleSync} className={styles.syncButton}>
          Sync Shows
        </button>
      </div>
      {notification.message && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Show Time</th>
              <th>Venue Name</th>
              <th>Venue Capacity</th>
              <th>Tickets Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shows.map((show) => (
              <tr
                key={show.show_id}
                className={!show.venue_name ? styles.newShow : ''}
              >
                <td>{show.event_name}</td>
                <td>{show.show_time}</td>
                <td>
                  {editingShow?.show_id === show.show_id ? (
                    <input
                      type="text"
                      value={editingShow.venue_name || ''}
                      onChange={(e) => handleChange(e, 'venue_name')}
                      className={styles.inputField}
                    />
                  ) : (
                    show.venue_name
                  )}
                </td>
                <td>
                  {editingShow?.show_id === show.show_id ? (
                    <input
                      type="number"
                      value={editingShow.venue_total_capacity || ''}
                      onChange={(e) => handleChange(e, 'venue_total_capacity')}
                      className={styles.inputField}
                    />
                  ) : (
                    show.venue_total_capacity
                  )}
                </td>
                <td>
                  {editingShow?.show_id === show.show_id ? (
                    <input
                      type="number"
                      value={editingShow.ticket_qty_available || ''}
                      onChange={(e) => handleChange(e, 'ticket_qty_available')}
                      className={styles.inputField}
                    />
                  ) : (
                    show.ticket_qty_available
                  )}
                </td>
                <td>
                  {editingShow?.show_id === show.show_id ? (
                    <>
                      <button
                        onClick={handleSave}
                        className={styles.saveButton}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(show)}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
