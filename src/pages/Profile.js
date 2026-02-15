import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { userProfile } = useAuth();

  return (
    <>
      <Navbar isAuthenticated={true} />
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        <div className="glass-panel" style={{ marginBottom: '40px' }}>
          <h1>Profile - Coming Soon</h1>
          <p className="text-muted">
            Your profile page is under construction. Here you'll be able to view your:
          </p>
          <ul className="text-muted" style={{ marginTop: '20px', marginLeft: '20px' }}>
            <li>Complete booking history</li>
            <li>Achievements and badges</li>
            <li>Productivity statistics</li>
            <li>Account settings</li>
          </ul>
          
          {userProfile && (
            <div style={{ marginTop: '40px' }}>
              <h3>Current Stats:</h3>
              <p>Level: {userProfile.stats?.level || 1}</p>
              <p>XP: {userProfile.stats?.xp || 0}</p>
              <p>Total Bookings: {userProfile.stats?.totalBookings || 0}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
