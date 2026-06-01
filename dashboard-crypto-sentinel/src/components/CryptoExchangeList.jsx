import { motion } from 'framer-motion';
import { Globe, AlertTriangle } from 'lucide-react';
import { cryptoExchangeData, formatCurrency } from '../data/mockData';

export default function CryptoExchangeList() {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.5 }}
      id="crypto-exchange-card"
    >
      <div className="card-header">
        <div className="card-title">
          <Globe />
          Target Crypto Exchange
        </div>
      </div>
      <div className="card-body">
        <div className="exchange-list">
          {cryptoExchangeData.map((exchange, index) => (
            <motion.div
              key={exchange.name}
              className="exchange-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.08 }}
            >
              <div className="exchange-logo">
                {exchange.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="exchange-info">
                <div className="exchange-name">
                  {exchange.name}
                  {exchange.risk === 'high' && (
                    <AlertTriangle
                      size={13}
                      style={{ marginLeft: 6, color: 'var(--status-danger)', display: 'inline', verticalAlign: 'middle' }}
                    />
                  )}
                </div>
                <div className="exchange-txns">{exchange.transactions} transaksi dicegah</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="exchange-amount">{formatCurrency(exchange.amount)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 3 }}>
                  <div
                    style={{
                      width: 50,
                      height: 4,
                      background: 'var(--bg-elevated)',
                      borderRadius: 99,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${exchange.percentage}%`,
                        height: '100%',
                        background:
                          exchange.risk === 'high'
                            ? 'var(--status-danger)'
                            : exchange.risk === 'medium'
                            ? 'var(--status-warning)'
                            : 'var(--status-success)',
                        borderRadius: 99,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono'" }}>
                    {exchange.percentage}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
