
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiBarChart2, FiUpload, FiSettings } from 'react-icons/fi';
import styles from '../styles/Layout.module.css';

export default function Layout({ children }) {
    const router = useRouter();

    const navItems = [
        { href: '/', label: 'HOME', icon: <FiHome /> },
        { href: '/shows', label: 'SHOWS', icon: <FiBarChart2 /> },
        { href: '/ingest', label: 'INGEST CSV', icon: <FiUpload /> },
        { href: '/admin', label: 'ADMIN', icon: <FiSettings /> },
    ];

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    TheatreTrack®
                </div>
                <nav className={styles.nav}>
                    <ul>
                        {navItems.map(item => (
                            <li key={item.href} className={`${styles.navItem} ${router.pathname === item.href ? styles.activeNavItem : ''}`}>
                                <Link href={item.href} className={styles.navLink}>
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className={styles.sidebarFooter}>
                    <div className={styles.salesSummary}>
                        <div className={styles.salesBlock}>
                            <div className={styles.salesBlockTitle}>Total Sales</div>
                            <div className={styles.salesDetail}>
                                <span className={styles.salesLabel}>Gross:</span>
                                <span>£545k</span>
                            </div>
                            <div className={styles.salesDetail}>
                                <span className={styles.salesLabel}>Sold:</span>
                                <span>9536</span>
                            </div>
                        </div>
                        <div className={styles.salesBlock}>
                            <div className={styles.salesBlockTitle}>Yesterday's Sales</div>
                            <div className={styles.salesDetail}>
                                <span className={styles.salesLabel}>Gross:</span>
                                <span>£842</span>
                            </div>
                            <div className={styles.salesDetail}>
                                <span className={styles.salesLabel}>Sold:</span>
                                <span>13</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.statusIndicator}>
                        <span className={styles.connectedDot}></span>
                        Database Connected
                    </div>
                    <div className={styles.versionInfo}>
                        <p>18/11/2025 21:22:25</p>
                        <p className={styles.version}>v1.2.5</p>
                    </div>
                </div>
            </aside>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
