import {
  collection,
  doc,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

class SeatService {
  // Initialize 50 seats
  async initializeSeats() {
    try {
      const seatsRef = collection(db, 'seats');
      
      // Check if seats already exist
      const snapshot = await getDocs(seatsRef);
      if (!snapshot.empty) {
        console.log('Seats already initialized');
        return;
      }

      // Create 50 seats
      const seatTypes = ['standard', 'stand', 'pod'];
      const promises = [];

      for (let i = 1; i <= 50; i++) {
        const type = i <= 35 ? 'standard' : i <= 43 ? 'stand' : 'pod';
        
        promises.push(
          addDoc(seatsRef, {
            id: `S-${String(i).padStart(3, '0')}`,
            type,
            status: 'available',
            floor: i <= 25 ? 1 : 2,
            currentBooking: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        );
      }

      await Promise.all(promises);
      console.log('Successfully initialized 50 seats');
    } catch (error) {
      console.error('Error initializing seats:', error);
      throw error;
    }
  }

  // Get all seats
  async getSeats() {
    try {
      const snapshot = await getDocs(collection(db, 'seats'));
      return snapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching seats:', error);
      throw error;
    }
  }

  // Listen to real-time seat updates
  listenToSeats(callback) {
    try {
      const unsubscribe = onSnapshot(
        collection(db, 'seats'),
        (snapshot) => {
          const seats = snapshot.docs.map(doc => ({
            firestoreId: doc.id,
            ...doc.data()
          }));
          callback(seats);
        },
        (error) => {
          console.error('Error listening to seats:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up seat listener:', error);
      throw error;
    }
  }
}

export default new SeatService();
