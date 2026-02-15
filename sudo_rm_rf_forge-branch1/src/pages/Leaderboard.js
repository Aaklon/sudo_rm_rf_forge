import React from 'react';
import Navbar from '../components/Navbar';

const Leaderboard = () => {
  return (
    <>
      <Navbar isAuthenticated={true} />
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        <div className="glass-panel text-center">
          <h1 style={{ marginBottom: '20px' }}>🏆 Leaderboard</h1>
          <p className="text-muted" style={{ fontSize: '1.125rem' }}>
            The leaderboard feature is coming soon! Here you'll be able to:
          </p>
          <ul className="text-muted" style={{ marginTop: '20px', marginLeft: '20px', textAlign: 'left', maxWidth: '500px', margin: '20px auto' }}>
            <li>See top users by XP</li>
            <li>View weekly and monthly rankings</li>
            <li>Compare your stats with others</li>
            <li>Earn special badges for top positions</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
