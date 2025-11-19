import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { FiHome, FiBarChart2, FiUpload, FiSettings, FiDatabase } from 'react-icons/fi'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/Layout.module.css'
import SalesStats from './SalesStats'
import packageJson from '../../package.json'

export default function Layout({ children }) {
  const router = useRouter()
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [isDbConnected, setIsDbConnected] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    const checkDbConnection = async () => {
      const { error } = await supabase.from('event_summary').select('event_name').limit(1)
      setIsDbConnected(!error)
    }

    checkDbConnection()
    const dbCheckInterval = setInterval(checkDbConnection, 60000) // Check every minute

    return () => {
      clearInterval(timer)
      clearInterval(dbCheckInterval)
    }
  }, [])

  const navItems = [
    { href: '/home', label: 'HOME', icon: <FiHome /> },
    { href: '/shows', label: 'SHOWS', icon: <FiBarChart2 /> },
    { href: '/ingest', label: 'INGEST CSV', icon: <FiUpload /> },
    { href: '/admin', label: 'ADMIN', icon: <FiSettings /> },
  ]

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>TheatreTrack®</div>
        <nav className={styles.nav}>
          <ul>
            {navItems.map((item) => (
              <li
                key={item.href}
                className={`${styles.navItem} ${
                  router.pathname === item.href ? styles.activeNavItem : ''
                }`}
              >
                <Link href={item.href} className={styles.navLink}>
                  <span className={styles.navIcon}>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.sidebarFooter}>
          <SalesStats />
          <div className={styles.statusIndicator}>
            <FiDatabase />
            <span
              className={`${styles.dot} ${
                isDbConnected ? styles.connectedDot : styles.disconnectedDot
              }`}
            ></span>
            {isDbConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div className={styles.versionInfo}>
            {isClient && <p>{currentDateTime.toLocaleString()}</p>}
            <p className={styles.version}>v{packageJson.version}</p>
          </div>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
