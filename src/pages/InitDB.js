import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import seatService from '../services/seatService';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const InitDB = () => {
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(false);

  const log = (message, type = 'info') => {
    const prefix = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: '📝'
    }[type] || '📝';

    setStatus(prev => [...prev, { message: `${prefix} ${message}`, type }]);
  };

  const initializeDatabase = async () => {
    setStatus([]);
    setLoading(true);

    try {
      log('Starting BookMySeat initialization...');

      // Step 1: Initialize Configuration
      log('Creating library configuration...');
      try {
        await setDoc(doc(db, 'config', 'library'), {
          name: 'BookMySeat Library',
          description: 'Premium focus spaces for deep work',
          openingTime: '08:00',
          closingTime: '22:00',
          rules: [
            'Maintain silence in all zones',
            'Clean your workspace before leaving',
            'No food or drinks (water allowed)',
            'Scan QR code to confirm arrival within grace period'
          ],
          maxBookingDuration: 120, // minutes
          minBookingDuration: 15, // minutes
          defaultGracePeriod: 10, // minutes
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        log('Configuration created', 'success');
      } catch (error) {
        log(`Configuration error: ${error.message}`, 'error');
        throw error;
      }

      // Step 2: Initialize Seats
      log('Creating 50 seats (this may take a moment)...');
      try {
        await seatService.initializeSeats();
        log('All seats created', 'success');
      } catch (error) {
        log(`Seats error: ${error.message}`, 'error');
        throw error;
      }

      log('');
      log('🎉 Initialization complete!', 'success');
      log('');
      log('📋 Next steps:', 'warning');
      log('1. Go to /auth and register an account');
      log('2. Go to Firebase Console → Authentication → Users');
      log('3. Find your user and copy the UID');
      log('4. Go to Firestore → users → [your UID]');
      log('5. Change "role" field from "student" to "admin"');
      log('6. Refresh and login as admin');

    } catch (error) {
      log('');
      log('Initialization failed: ' + error.message, 'error');
      log('');
      log('🔍 Troubleshooting:', 'warning');
      log('- Check that Firestore is enabled in Firebase Console');
      log('- Verify Firebase config in src/firebase/config.js');
      log('- Check browser console (F12) for detailed errors');
      log('- Make sure Firestore rules are properly set');

      console.error('Detailed error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (type) => {
    const colors = {
      success: 'var(--accent-success)',
      error: 'var(--accent-danger)',
      warning: 'var(--accent-gold)',
      info: 'var(--text-main)'
    };
    return colors[type] || colors.info;
  };

  return (
    <div className="auth-wrapper">
      <div className="hero-bg"></div>
      <div className="hero-glow"></div>

      <div className="glass-panel auth-box" style={{ maxWidth: '600px' }}>
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <div className="logo" style={{ marginBottom: '12px', fontSize: '2rem' }}>
            BookMySeat.
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
            Database Initialization
          </h2>
          <p className="text-muted">
            Run this once to set up your Firebase database
          </p>
        </div>

        <div
          className="glass-panel glass-panel-sm"
          style={{
            marginBottom: '24px',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {status.length === 0 ? (
            <p className="text-muted">Waiting to start...</p>
          ) : (
            status.map((item, index) => (
              <p
                key={index}
                style={{
                  margin: '4px 0',
                  color: getStatusColor(item.type)
                }}
              >
                {item.message}
              </p>
            ))
          )}
        </div>

        <button
          onClick={initializeDatabase}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '16px' }}
        >
          {loading ? 'Initializing...' : 'Initialize Database'}
        </button>

        <div className="text-center">
          <Link to="/" className="text-muted" style={{ fontSize: '0.875rem' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InitDB;
