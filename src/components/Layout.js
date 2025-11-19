import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiHome, FiBarChart2, FiUpload, FiSettings, FiDatabase } from 'react-icons/fi';
import styles from '../styles/Layout.module.css';
import SalesStats from './SalesStats';
import { useDatabaseStatus } from '@/hooks/useDatabaseStatus';

export default function Layout({ children, version }) {
  const router = useRouter();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { status } = useDatabaseStatus();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { href: '/', label: 'HOME', icon: <FiHome /> },
    { href: '/shows', label: 'SHOWS', icon: <FiBarChart2 /> },
    { href: '/ingest', label: 'INGEST CSV', icon: <FiUpload /> },
    { href: '/admin', label: 'ADMIN', icon: <FiSettings /> },
  ];

  const formatDateTime = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'connected':
        return <span className={`${styles.statusIcon} ${styles.connected}`}> <FiDatabase /> </span>;
      case 'not connected':
        return <span className={`${styles.statusIcon} ${styles.notConnected}`}> <FiDatabase /> </span>;
      case 'updating':
        return <span className={`${styles.statusIcon} ${styles.updating}`}> <FiDatabase /> </span>;
      default:
        return <span className={`${styles.statusIcon} ${styles.notConnected}`}> <FiDatabase /> </span>;
    }
  };

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
        <SalesStats />
        <div className={styles.sidebarFooter}>
          <div className={styles.statusIndicator}>
            {getStatusIndicator()}
            {status}
          </div>
          <div className={styles.versionInfo}>
            <p>{formatDateTime(currentDateTime)}</p>
            <p className={styles.version}>v{version}</p>
          </div>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
