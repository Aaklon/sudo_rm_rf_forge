import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import seatService from '../services/seatService';
import bookingService from '../services/bookingService';
import { SeatSkeleton, SidebarSkeleton, StatsCardSkeleton } from '../components/SkeletonLoaders';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    endTime: '',
    gracePeriod: 10
  });

  useEffect(() => {
    const unsubscribe = seatService.listenToSeats((updatedSeats) => {
      setSeats(updatedSeats);
      setLoading(false);
    });

    loadBookings();
    checkActiveBooking();

    // Scroll detection
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const loadBookings = async () => {
    try {
      const userBookings = await bookingService.getUserBookings(currentUser.uid);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const checkActiveBooking = async () => {
    try {
      await bookingService.checkAndProcessExpiredBookings(currentUser.uid);
      const active = await bookingService.getUserActiveBooking(currentUser.uid);
      setActiveBooking(active);
    } catch (error) {
      console.error('Error checking active booking:', error);
    }
  };

  const getFilteredSeats = () => {
    let filtered = seats;
    
    // Apply filter
    if (filter === 'available') {
      filtered = filtered.filter(s => s.status === 'available');
    } else if (filter !== 'all') {
      filtered = filtered.filter(s => s.type === filter);
    }
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickBookAvailable = () => {
    const availableSeats = seats.filter(s => s.status === 'available');
    if (availableSeats.length > 0) {
      handleSeatClick(availableSeats[0]);
    } else {
      alert('No seats available at the moment');
    }
  };

  const getCounts = () => ({
    all: seats.length,
    available: seats.filter(s => s.status === 'available').length,
    standard: seats.filter(s => s.type === 'standard').length,
    stand: seats.filter(s => s.type === 'stand').length,
    pod: seats.filter(s => s.type === 'pod').length
  });

  const handleSeatClick = (seat) => {
    if (seat.status !== 'available') {
      alert('This seat is not available');
      return;
    }
    setSelectedSeat(seat);
    
    const now = new Date();
    const startTime = new Date(Math.ceil(now.getTime() / (15 * 60000)) * (15 * 60000));
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
    
    setBookingForm({
      startTime: formatTimeForInput(startTime),
      endTime: formatTimeForInput(endTime),
      gracePeriod: 10
    });
    
    setShowBookingModal(true);
  };

  const formatTimeForInput = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleBookingSubmit = async () => {
    if (!selectedSeat) return;

    try {
      const today = new Date();
      const [startHour, startMin] = bookingForm.startTime.split(':').map(Number);
      const [endHour, endMin] = bookingForm.endTime.split(':').map(Number);

      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHour, startMin);
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHour, endMin);

      if (endTime <= startTime) endTime.setDate(endTime.getDate() + 1);

      const durationMins = Math.floor((endTime - startTime) / 60000);

      if (durationMins < 15) {
        alert('Minimum booking duration is 15 minutes');
        return;
      }
      if (durationMins > 120) {
        alert('Maximum booking duration is 2 hours');
        return;
      }

      await bookingService.createBooking(currentUser.uid, selectedSeat.id, startTime, endTime, bookingForm.gracePeriod);
      alert('Seat booked successfully!');
      setShowBookingModal(false);
      setSelectedSeat(null);
      await loadBookings();
      await checkActiveBooking();
    } catch (error) {
      alert(error.message || 'Failed to create booking');
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="dashboard-layout">
          <SidebarSkeleton />
          
          <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
            {/* Quick Stats Banner Skeleton */}
            <div className="glass-panel" style={{ marginBottom: '24px', padding: '20px' }}>
              <div className="flex justify-between items-center">
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '200px', height: '24px', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ width: '150px', height: '16px' }} />
                </div>
                <div className="flex gap-2">
                  <div className="skeleton" style={{ width: '80px', height: '36px', borderRadius: '8px' }} />
                  <div className="skeleton" style={{ width: '80px', height: '36px', borderRadius: '8px' }} />
                  <div className="skeleton" style={{ width: '80px', height: '36px', borderRadius: '8px' }} />
                </div>
              </div>
            </div>

            {/* Seat Grid Skeleton */}
            <div className="seat-grid">
              {[...Array(20)].map((_, i) => (
                <SeatSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  const filteredSeats = getFilteredSeats();
  const counts = getCounts();

  return (
    <>
      <Navbar isAuthenticated={true} />
      
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        {/* Quick Stats Banner */}
        <div className="quick-stats-banner">
          <div className="quick-stat-item">
            <div className="quick-stat-icon">⚡</div>
            <div className="quick-stat-content">
              <span className="quick-stat-value text-primary">{counts.available}</span>
              <span className="quick-stat-label">Available</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon">🎯</div>
            <div className="quick-stat-content">
              <span className="quick-stat-value text-teal">{userProfile?.stats?.level || 1}</span>
              <span className="quick-stat-label">Level</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon">🏆</div>
            <div className="quick-stat-content">
              <span className="quick-stat-value text-gold">{userProfile?.stats?.xp || 0}</span>
              <span className="quick-stat-label">Total XP</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon">📚</div>
            <div className="quick-stat-content">
              <span className="quick-stat-value text-secondary">{userProfile?.stats?.totalBookings || 0}</span>
              <span className="quick-stat-label">Bookings</span>
            </div>
          </div>
        </div>

        {activeBooking && (
          <div style={{ background: 'var(--gradient-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', color: 'white' }}>
            <h3 style={{ marginBottom: '8px', color: 'white' }}>Session Active</h3>
            <p>Seat: {activeBooking.seatId?.id || 'Unknown'}</p>
            <button onClick={() => activeBooking.status === 'pending' ? bookingService.startSession(activeBooking.id, currentUser.uid).then(checkActiveBooking) : bookingService.checkOut(activeBooking.id, currentUser.uid).then(() => { loadBookings(); checkActiveBooking(); })} className="btn btn-secondary btn-sm">
              {activeBooking.status === 'pending' ? 'Start Session' : 'End Session'}
            </button>
          </div>
        )}

        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2>Available Seats</h2>
            
            {/* Search Bar */}
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search seat number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2" style={{ marginTop: '16px', flexWrap: 'wrap' }}>
            {['all', 'available', 'standard', 'stand', 'pod'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
              </button>
            ))}
          </div>
        </div>

        <div className="seat-grid">
          {filteredSeats.map(seat => (
            <div key={seat.firestoreId} className={`seat ${seat.status} type-${seat.type}`} onClick={() => handleSeatClick(seat)}>
              {seat.id?.replace('S-', '')}
            </div>
          ))}
        </div>
        
        {filteredSeats.length === 0 && (
          <div className="glass-panel text-center" style={{ marginTop: '40px' }}>
            <h3>No seats found</h3>
            <p className="text-muted">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="quick-action-btn" 
          onClick={quickBookAvailable}
          title="Quick Book"
        >
          <span className="tooltip">Quick Book</span>
          ⚡
        </button>
        <button 
          className="quick-action-btn" 
          onClick={() => setFilter('available')}
          style={{ background: 'var(--gradient-secondary)' }}
          title="Show Available"
        >
          <span className="tooltip">Show Available</span>
          🎯
        </button>
      </div>

      {/* Scroll to Top */}
      <button 
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        style={{ bottom: '100px' }}
      >
        ↑
      </button>

      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Book {selectedSeat?.id}</h3>
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" value={bookingForm.startTime} onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})} className="form-input" />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="time" value={bookingForm.endTime} onChange={(e) => setBookingForm({...bookingForm, endTime: e.target.value})} className="form-input" />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowBookingModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleBookingSubmit} className="btn btn-primary">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;