import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { timelineData } from '../data/mockData';

export default function ActivityTimeline({ transactions = [] }) {
  const isLive = transactions.length > 0;

  let items;
  if (isLive) {
    items = transactions.slice(0, 5).map(tx => {
      const isBlocked = tx.status === 'blocked' || tx.status === 'BLOCK';
      const isFlagged = tx.status === 'flagged' || tx.status === 'REVIEW';
      const type = isBlocked ? 'danger' : isFlagged ? 'warning' : 'primary';

      let timeStr = tx.timestamp || 'Baru saja';
      if (timeStr.includes(' ')) {
        timeStr = timeStr.split(' ')[1]?.substring(0, 5) + ' WIB';
      }

      return {
        title: isBlocked
          ? `Pemblokiran Transaksi ${tx.id}`
          : isFlagged
          ? `Review Transaksi ${tx.id}`
          : `Persetujuan Transaksi ${tx.id}`,
        desc: `${tx.senderName || tx.senderAccount} transfer Rp ${Number(tx.amount || 0).toLocaleString('id-ID')} ke ${tx.destination || tx.destinationAccount}`,
        time: timeStr,
        type: type,
      };
    });
  } else {
    items = timelineData;
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.95, duration: 0.5 }}
      id="activity-timeline-card"
    >
      <div className="card-header">
        <div className="card-title">
          <Clock />
          Timeline Aktivitas
        </div>
        <div className="card-actions">
          {isLive && (
            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 6 }}>
              🟢 REAL-TIME
            </span>
          )}
          <button className="card-action-btn active">Live Feed</button>
        </div>
      </div>
      <div className="card-body">
        <div className="timeline">
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="timeline-item"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.08, duration: 0.3 }}
            >
              <div className={`timeline-dot ${item.type}`} />
              <div className="timeline-content">
                <div className="timeline-title">{item.title}</div>
                <div className="timeline-desc">{item.desc}</div>
                <div className="timeline-time">{item.time}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
