import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { timelineData } from '../data/mockData';

export default function ActivityTimeline() {
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
          <button className="card-action-btn active">Hari Ini</button>
          <button className="card-action-btn">Kemarin</button>
        </div>
      </div>
      <div className="card-body">
        <div className="timeline">
          {timelineData.map((item, index) => (
            <motion.div
              key={index}
              className="timeline-item"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 + index * 0.08, duration: 0.3 }}
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
