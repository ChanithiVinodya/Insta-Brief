import React from 'react';

export default function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div style={{ 
      background: 'var(--accent)', 
      color: 'white', 
      padding: '1rem', 
      marginBottom: '1.5rem',
      border: '2px solid var(--rule)',
      fontFamily: 'var(--font-ui)',
      fontSize: '12px',
      textAlign: 'center',
      letterSpacing: '1px'
    }}>
      ◆ CORRUPTION DETECTED: {message.toUpperCase()} ◆
    </div>
  );
}
