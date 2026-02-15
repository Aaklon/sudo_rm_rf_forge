import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user profile from Firestore
  const getUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  // Create user profile in Firestore
  const createUserProfile = async (uid, data) => {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...data,
        role: 'student',
        stats: {
          xp: 0,
          level: 1,
          totalMinutes: 0,
          totalBookings: 0
        },
        achievements: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Sign up with email and password
  const signup = async (userData) => {
    try {
      const { email, password, name } = userData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user.uid, {
        name,
        email,
        rollNo: userData.rollNo || '',
        department: userData.department || '',
        year: userData.year || 1,
        phone: userData.phone || ''
      });
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(userCredential.user.uid);
      return { user: userCredential.user, profile };
    } catch (error) {
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists
      let profile = await getUserProfile(result.user.uid);
      
      // Create profile if it doesn't exist
      if (!profile) {
        await createUserProfile(result.user.uid, {
          name: result.user.displayName || 'User',
          email: result.user.email,
          rollNo: '',
          department: '',
          year: 1,
          phone: ''
        });
        profile = await getUserProfile(result.user.uid);
      }
      
      return { user: result.user, profile };
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
