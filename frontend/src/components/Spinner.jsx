import React from 'react';

export default function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="heading" style={{ 
        fontSize: '14px', 
        fontStyle: 'italic',
        letterSpacing: '2px',
        animation: 'pulse 1.5s infinite'
      }}>
        ◆ TRANSMITTING ◆
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
