import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

class BookingService {
  // Create a new booking
  async createBooking(userId, seatId, startTime, endTime, gracePeriod = 10) {
    try {
      const gracePeriodEnd = new Date(startTime.getTime() + gracePeriod * 60000);
      
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        userId,
        seatId: doc(db, 'seats', seatId),
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
        gracePeriod,
        gracePeriodEnd: Timestamp.fromDate(gracePeriodEnd),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update seat status
      await updateDoc(doc(db, 'seats', seatId), {
        status: 'booked',
        currentBooking: bookingRef.id,
        updatedAt: serverTimestamp()
      });

      return bookingRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  // Get user bookings
  async getUserBookings(userId) {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const bookings = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        bookings.push({
          id: docSnap.id,
          ...data
        });
      }

      return bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  // Get active booking for user
  async getUserActiveBooking(userId) {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        where('status', 'in', ['pending', 'active'])
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error fetching active booking:', error);
      return null;
    }
  }

  // Start session (mark as active)
  async startSession(bookingId, userId) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data();
      if (booking.userId !== userId) {
        throw new Error('Unauthorized');
      }

      await updateDoc(bookingRef, {
        status: 'active',
        actualStartTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update seat status
      const seatId = typeof booking.seatId === 'object' ? booking.seatId.id : booking.seatId;
      await updateDoc(doc(db, 'seats', seatId), {
        status: 'occupied',
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  // Check out (end session)
  async checkOut(bookingId, userId) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data();
      if (booking.userId !== userId) {
        throw new Error('Unauthorized');
      }

      const actualStartTime = booking.actualStartTime?.toDate() || booking.startTime.toDate();
      const now = new Date();
      const durationMs = now - actualStartTime;
      const durationMins = Math.floor(durationMs / 60000);

      // Calculate XP (1 XP per minute)
      const xpEarned = Math.floor(durationMins);

      await updateDoc(bookingRef, {
        status: 'completed',
        actualEndTime: serverTimestamp(),
        duration: durationMins,
        xpEarned,
        updatedAt: serverTimestamp()
      });

      // Update user stats
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const newXP = (userData.stats?.xp || 0) + xpEarned;
      const newLevel = Math.floor(newXP / 1000) + 1;

      await updateDoc(userRef, {
        'stats.xp': newXP,
        'stats.level': newLevel,
        'stats.totalMinutes': (userData.stats?.totalMinutes || 0) + durationMins,
        'stats.totalBookings': (userData.stats?.totalBookings || 0) + 1,
        updatedAt: serverTimestamp()
      });

      // Release seat
      const seatId = typeof booking.seatId === 'object' ? booking.seatId.id : booking.seatId;
      await updateDoc(doc(db, 'seats', seatId), {
        status: 'available',
        currentBooking: null,
        updatedAt: serverTimestamp()
      });

      return { xpEarned, durationMins };
    } catch (error) {
      console.error('Error checking out:', error);
      throw error;
    }
  }

  // Update booking
  async updateBooking(bookingId, userId, updates) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data();
      if (booking.userId !== userId) {
        throw new Error('Unauthorized');
      }

      if (booking.status !== 'pending') {
        throw new Error('Can only update pending bookings');
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      if (updates.startTime) {
        updateData.startTime = Timestamp.fromDate(updates.startTime);
      }
      if (updates.endTime) {
        updateData.endTime = Timestamp.fromDate(updates.endTime);
      }

      await updateDoc(bookingRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(bookingId) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data();

      await updateDoc(bookingRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });

      // Release seat
      const seatId = typeof booking.seatId === 'object' ? booking.seatId.id : booking.seatId;
      await updateDoc(doc(db, 'seats', seatId), {
        status: 'available',
        currentBooking: null,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Check and process expired bookings
  async checkAndProcessExpiredBookings(userId) {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      const now = new Date();

      for (const docSnap of snapshot.docs) {
        const booking = docSnap.data();
        const gracePeriodEnd = booking.gracePeriodEnd.toDate();

        if (now > gracePeriodEnd) {
          // Mark as no-show
          await updateDoc(doc(db, 'bookings', docSnap.id), {
            status: 'no_show',
            updatedAt: serverTimestamp()
          });

          // Release seat
          const seatId = typeof booking.seatId === 'object' ? booking.seatId.id : booking.seatId;
          await updateDoc(doc(db, 'seats', seatId), {
            status: 'available',
            currentBooking: null,
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Error processing expired bookings:', error);
    }
  }
}

export default new BookingService();
