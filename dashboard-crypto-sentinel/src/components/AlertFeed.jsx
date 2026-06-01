import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { alertFeed } from '../data/mockData';

const iconMap = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
};

export default function AlertFeed({ alerts: propAlerts }) {
  const activeAlerts = propAlerts || alertFeed;

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      id="alert-feed-card"
    >
      <div className="card-header">
        <div className="card-title">
          <ShieldAlert />
          Alert Real-time
        </div>
        <div className="card-actions">
          <button className="card-action-btn active">Semua</button>
        </div>
      </div>
      <div className="card-body">
        <div className="alert-feed">
          {activeAlerts.slice(0, 5).map((alert, index) => {
            const Icon = iconMap[alert.type];
            return (
              <motion.div
                key={alert.id}
                className={`alert-item ${alert.type}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.08, duration: 0.3 }}
                id={`alert-item-${alert.id}`}
              >
                <div className={`alert-icon ${alert.type}`}>
                  <Icon size={18} />
                </div>
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-desc">{alert.description}</div>
                </div>
                <div className="alert-time">{alert.time}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

