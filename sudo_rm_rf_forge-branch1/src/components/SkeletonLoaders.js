import React from 'react';

// Base Skeleton component
export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', style = {} }) => (
  <div
    className="skeleton"
    style={{
      width,
      height,
      borderRadius,
      ...style
    }}
  />
);

// Card Skeleton for dashboard seats
export const SeatSkeleton = () => (
  <div className="seat-skeleton">
    <Skeleton width="100%" height="70px" borderRadius="12px" />
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
  <div className="glass-panel text-center" style={{ padding: '24px' }}>
    <Skeleton width="80px" height="32px" style={{ margin: '0 auto 8px' }} />
    <Skeleton width="60%" height="16px" style={{ margin: '0 auto' }} />
  </div>
);

// Achievement Card Skeleton
export const AchievementCardSkeleton = () => (
  <div className="card" style={{ textAlign: 'center' }}>
    <Skeleton width="60px" height="60px" borderRadius="50%" style={{ margin: '0 auto 12px' }} />
    <Skeleton width="80%" height="20px" style={{ margin: '0 auto 8px' }} />
    <Skeleton width="100%" height="16px" style={{ margin: '0 auto 8px' }} />
    <Skeleton width="60px" height="24px" borderRadius="12px" style={{ margin: '0 auto' }} />
  </div>
);

// Booking History Item Skeleton
export const BookingItemSkeleton = () => (
  <div
    className="flex justify-between items-center"
    style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}
  >
    <div style={{ flex: 1 }}>
      <Skeleton width="150px" height="20px" style={{ marginBottom: '8px' }} />
      <Skeleton width="250px" height="16px" />
    </div>
    <Skeleton width="80px" height="24px" />
  </div>
);

// Profile Header Skeleton
export const ProfileHeaderSkeleton = () => (
  <div className="glass-panel" style={{ marginBottom: '40px' }}>
    <div className="flex justify-between items-start flex-wrap gap-4">
      <div>
        <Skeleton width="200px" height="32px" style={{ marginBottom: '8px' }} />
        <Skeleton width="250px" height="20px" style={{ marginBottom: '16px' }} />
        <div className="flex gap-2">
          <Skeleton width="80px" height="28px" borderRadius="20px" />
          <Skeleton width="80px" height="28px" borderRadius="20px" />
          <Skeleton width="120px" height="28px" borderRadius="20px" />
        </div>
      </div>
      <Skeleton width="140px" height="40px" borderRadius="8px" />
    </div>
  </div>
);

// Sidebar Skeleton
export const SidebarSkeleton = () => (
  <aside className="sidebar">
    <div className="stats-card">
      <Skeleton width="100%" height="20px" style={{ marginBottom: '12px' }} />
      <Skeleton width="100%" height="10px" style={{ marginBottom: '8px' }} />
      <Skeleton width="60%" height="12px" />
    </div>
    
    <div className="glass-panel glass-panel-sm" style={{ marginBottom: '16px' }}>
      <Skeleton width="100px" height="16px" style={{ marginBottom: '16px' }} />
      <div style={{ marginBottom: '12px' }}>
        <Skeleton width="100%" height="16px" />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <Skeleton width="100%" height="16px" />
      </div>
      <div>
        <Skeleton width="100%" height="16px" />
      </div>
    </div>
  </aside>
);

// Leaderboard Row Skeleton
export const LeaderboardRowSkeleton = () => (
  <div
    className="flex justify-between items-center"
    style={{
      padding: '16px',
      borderBottom: '1px solid var(--border-color)'
    }}
  >
    <div className="flex items-center gap-4" style={{ flex: 1 }}>
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton width="150px" height="20px" style={{ marginBottom: '4px' }} />
        <Skeleton width="100px" height="16px" />
      </div>
    </div>
    <div className="text-right">
      <Skeleton width="80px" height="24px" style={{ marginBottom: '4px' }} />
      <Skeleton width="60px" height="16px" />
    </div>
  </div>
);

export default {
  Skeleton,
  SeatSkeleton,
  StatsCardSkeleton,
  AchievementCardSkeleton,
  BookingItemSkeleton,
  ProfileHeaderSkeleton,
  SidebarSkeleton,
  LeaderboardRowSkeleton
};