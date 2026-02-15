import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import bookingService from '../services/bookingService';

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first_booking', name: 'First Step', description: 'Complete your first booking', icon: '🎯', xp: 50 },
  { id: 'early_bird', name: 'Early Bird', description: 'Book a seat before 8 AM', icon: '🌅', xp: 100 },
  { id: 'night_owl', name: 'Night Owl', description: 'Book a seat after 8 PM', icon: '🦉', xp: 100 },
  { id: 'streak_3', name: '3-Day Streak', description: 'Book seats for 3 consecutive days', icon: '🔥', xp: 150 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Book seats for 7 consecutive days', icon: '💪', xp: 300 },
  { id: 'marathon', name: 'Marathon', description: 'Study for 4+ hours in one session', icon: '⏱️', xp: 200 },
  { id: 'century', name: 'Century Club', description: 'Complete 100 bookings', icon: '💯', xp: 500 },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐', xp: 250 },
  { id: 'level_10', name: 'Productivity Pro', description: 'Reach level 10', icon: '🚀', xp: 500 },
  { id: 'perfect_week', name: 'Perfect Week', description: 'Book every day for a week', icon: '✨', xp: 400 },
  { id: 'focus_master', name: 'Focus Master', description: 'Accumulate 100 hours of focus time', icon: '🧘', xp: 600 },
  { id: 'bookworm', name: 'Bookworm', description: 'Study for 1000 total minutes', icon: '📚', xp: 300 }
];

const Profile = () => {
  const { currentUser, userProfile, getUserProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    totalMinutes: 0,
    totalBookings: 0,
    achievementCount: 0
  });

  useEffect(() => {
    loadProfileData();
  }, [currentUser]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Reload user profile to get latest stats
      const profile = await getUserProfile(currentUser.uid);
      
      // Load bookings
      const userBookings = await bookingService.getUserBookings(currentUser.uid);
      setBookings(userBookings);

      // Set stats
      setStats({
        totalXP: profile.stats?.xp || 0,
        level: profile.stats?.level || 1,
        totalMinutes: profile.stats?.totalMinutes || 0,
        totalBookings: profile.stats?.totalBookings || 0,
        achievementCount: profile.achievements?.length || 0
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const exportData = () => {
    const exportData = {
      profile: {
        name: userProfile.name,
        email: userProfile.email,
        department: userProfile.department,
        rollNo: userProfile.rollNo
      },
      stats: stats,
      achievements: userProfile.achievements || [],
      bookings: bookings.map(b => ({
        seatId: typeof b.seatId === 'object' ? b.seatId.id : b.seatId,
        startTime: b.startTime?.toDate?.() || new Date(b.startTime?.seconds * 1000),
        endTime: b.endTime?.toDate?.() || new Date(b.endTime?.seconds * 1000),
        status: b.status,
        duration: b.duration,
        xpEarned: b.xpEarned
      })),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookmyseat_profile_${currentUser.uid}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('Profile data exported successfully!');
  };

  const getMemberSince = () => {
    if (userProfile?.createdAt) {
      const date = userProfile.createdAt.toDate 
        ? userProfile.createdAt.toDate() 
        : new Date(userProfile.createdAt);
      return date.getFullYear();
    }
    return new Date().getFullYear();
  };

  const getUnlockedAchievements = () => {
    const userAchievements = userProfile?.achievements || [];
    return ACHIEVEMENTS.filter(a => userAchievements.includes(a.id));
  };

  const getLockedAchievements = () => {
    const userAchievements = userProfile?.achievements || [];
    return ACHIEVEMENTS.filter(a => !userAchievements.includes(a.id));
  };

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
          <div className="loader-container">
            <div className="loader-spinner"></div>
            <p className="loader-text">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();

  return (
    <>
      <Navbar isAuthenticated={true} />
      
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        {/* Profile Header */}
        <div className="glass-panel" style={{ marginBottom: '40px' }}>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 style={{ marginBottom: '8px' }}>{userProfile?.name || 'User'}</h1>
              <p className="text-muted">{userProfile?.email}</p>
              <div className="flex gap-2" style={{ marginTop: '16px', flexWrap: 'wrap' }}>
                <span className="badge badge-gold">Level {stats.level}</span>
                <span className="badge badge-primary">Rank #{stats.level}</span>
                <span className="badge" style={{ 
                  background: 'rgba(16, 185, 129, 0.2)', 
                  color: 'var(--accent-success)',
                  border: '1px solid var(--accent-success)'
                }}>
                  Member since {getMemberSince()}
                </span>
              </div>
            </div>
            <button onClick={exportData} className="btn btn-secondary">
              📥 Export Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '40px' }}>
          <div className="glass-panel text-center">
            <div className="stat-value">{stats.totalXP.toLocaleString()}</div>
            <div className="stat-label">Total XP</div>
          </div>
          <div className="glass-panel text-center">
            <div className="stat-value text-teal">{formatDuration(stats.totalMinutes)}</div>
            <div className="stat-label">Focus Time</div>
          </div>
          <div className="glass-panel text-center">
            <div className="stat-value text-gold">{stats.totalBookings}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="glass-panel text-center">
            <div className="stat-value" style={{ color: 'var(--accent-secondary)' }}>
              {stats.achievementCount}
            </div>
            <div className="stat-label">Achievements</div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="glass-panel" style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '24px' }}>🏆 Achievements</h2>

          <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>
            Unlocked ({unlockedAchievements.length})
          </h3>
          
          {unlockedAchievements.length > 0 ? (
            <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '32px' }}>
              {unlockedAchievements.map(achievement => (
                <div key={achievement.id} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{achievement.icon}</div>
                  <h4 style={{ marginBottom: '8px' }}>{achievement.name}</h4>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                    {achievement.description}
                  </p>
                  <span className="badge badge-gold">+{achievement.xp} XP</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted" style={{ marginBottom: '32px' }}>
              No achievements unlocked yet. Start booking seats to earn achievements!
            </p>
          )}

          <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>
            Locked ({lockedAchievements.length})
          </h3>
          
          {lockedAchievements.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {lockedAchievements.map(achievement => (
                <div key={achievement.id} className="card" style={{ textAlign: 'center', opacity: 0.5 }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px', filter: 'grayscale(100%)' }}>
                    {achievement.icon}
                  </div>
                  <h4 style={{ marginBottom: '8px' }}>🔒 {achievement.name}</h4>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
                    {achievement.description}
                  </p>
                  <span className="badge badge-primary">+{achievement.xp} XP</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">All achievements unlocked! 🎉</p>
          )}
        </div>

        {/* Booking History */}
        <div className="glass-panel">
          <h2 style={{ marginBottom: '24px' }}>📚 Booking History</h2>
          
          {bookings.length > 0 ? (
            <div>
              {bookings.map((booking, index) => {
                const seatId = typeof booking.seatId === 'object' 
                  ? booking.seatId.id || booking.seatId.path?.split('/').pop() || 'Unknown'
                  : booking.seatId;
                
                const startTime = booking.startTime?.toDate 
                  ? booking.startTime.toDate() 
                  : new Date(booking.startTime?.seconds * 1000);
                
                const endTime = booking.endTime?.toDate 
                  ? booking.endTime.toDate() 
                  : new Date(booking.endTime?.seconds * 1000);

                let badgeClass = 'badge-gold';
                if (booking.status === 'completed') badgeClass = 'badge-success';
                else if (booking.status === 'active') badgeClass = 'badge-primary';
                else if (booking.status === 'cancelled' || booking.status === 'no_show') {
                  badgeClass = 'badge-primary';
                }

                const badgeStyle = booking.status === 'success' ? {
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--accent-success)',
                  border: '1px solid var(--accent-success)'
                } : {};

                return (
                  <div 
                    key={booking.id || index} 
                    className="flex justify-between items-center" 
                    style={{ 
                      padding: '16px', 
                      borderBottom: index < bookings.length - 1 ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, marginBottom: '4px' }}>
                        Seat {seatId}
                        <span 
                          className={`badge ${badgeClass}`} 
                          style={{ marginLeft: '8px', ...badgeStyle }}
                        >
                          {booking.status}
                        </span>
                      </p>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {startTime.toLocaleDateString()} {' '}
                        {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {booking.duration && (
                        <p className="text-teal" style={{ fontSize: '0.75rem' }}>
                          Duration: {formatDuration(booking.duration)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {booking.xpEarned && (
                        <p className="text-gold" style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                          +{booking.xpEarned} XP
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted text-center">
              No bookings yet. Visit the dashboard to book your first seat!
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;