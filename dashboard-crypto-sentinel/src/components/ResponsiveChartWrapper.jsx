import React, { useState, useEffect, useRef } from 'react';

/**
 * Bulletproof Responsive Chart Wrapper for Recharts
 * Replaces Recharts' ResponsiveContainer to prevent 0-height / 0-width bugs
 * on mobile browsers, Framer Motion animations, and WebKit rendering engines.
 */
export default function ResponsiveChartWrapper({ children, height = 260, minHeight }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rectWidth = el.getBoundingClientRect().width || el.clientWidth || 320;
      if (rectWidth > 0) {
        setWidth(rectWidth);
      }
    };

    // Initial measurement
    measure();

    // ResizeObserver for dynamic layout updates
    const observer = new ResizeObserver(() => {
      measure();
    });

    observer.observe(el);

    // Fast initial fallback timer for animations
    const timer1 = setTimeout(measure, 50);
    const timer2 = setTimeout(measure, 240);

    return () => {
      observer.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const actualHeight = height || minHeight || 260;

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: actualHeight, 
        minHeight: actualHeight, 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {width > 0 ? (
        children(width, actualHeight)
      ) : (
        <div style={{ width: '100%', height: actualHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem' }}>
          Loading chart...
        </div>
      )}
    </div>
  );
}
