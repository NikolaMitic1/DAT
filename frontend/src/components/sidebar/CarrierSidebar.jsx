// src/components/sidebar/CarrierSidebar.jsx
import styles from "./CarrierSidebar.module.css";
import {
  Home,
  Search,
  Truck,
  Package,
  Lock,
  Wrench,
  Bell,
  HelpCircle,
  User,
} from "lucide-react";

export default function CarrierSidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.top}>
        <div className={styles.logo}>DAT Carrier</div>

        <ul className={styles.menu}>
          <li className={`${styles.item} ${styles.active}`}>
            <Home className={styles.icon} /> Dashboard
          </li>

          <li className={styles.item}>
            <Search className={styles.icon} /> Search Loads
          </li>

          <li className={styles.item}>
            <Truck className={styles.icon} /> My Trucks
          </li>

          <li className={styles.item}>
            <Package className={styles.icon} /> My Loads
          </li>

          <li className={styles.item}>
            <Lock className={styles.icon} /> Private Network
          </li>

          <li className={styles.item}>
            <Wrench className={styles.icon} /> Tools
          </li>
        </ul>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomItem}>
          <Bell /> Notifications
        </div>
        <div className={styles.bottomItem}>
          <HelpCircle /> Support
        </div>
        <div className={styles.bottomItem}>
          <User /> My Account
        </div>
      </div>
    </div>
  );
}
