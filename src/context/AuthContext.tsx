import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import {
  checkUserIsAdmin,
  ensureAdminRecord,
  syncCustomerOnAuth,
  saveCustomerProfile,
  deleteCustomerAccountInFirestore
} from '../services/firestoreService';
import { CustomerUser } from '../types';

const AUTHORIZED_ADMIN_EMAIL = 'gaugehouse1998@gmail.com';

interface AuthContextType {
  user: User | null;
  customerProfile: CustomerUser | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  adminSignInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
  }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
  updateCustomerData: (data: Partial<CustomerUser>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const verifyAdmin = async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser || !currentUser.email) {
      setIsAdmin(false);
      return false;
    }
    // Strict email check: only the authorized admin account can ever be verified as admin
    if (currentUser.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      setIsAdmin(false);
      return false;
    }
    await ensureAdminRecord(currentUser);
    const admin = await checkUserIsAdmin(currentUser);
    setIsAdmin(admin);
    return admin;
  };

  const syncProfile = async (currentUser: User | null, extra?: { name?: string; phone?: string; address?: string; city?: string }) => {
    if (!currentUser) {
      setCustomerProfile(null);
      return;
    }
    try {
      const profile = await syncCustomerOnAuth(currentUser, extra);
      setCustomerProfile(profile);
    } catch (err) {
      console.warn('Could not sync customer profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      try {
        if (currentUser) {
          await verifyAdmin(currentUser);
          await syncProfile(currentUser);
        } else {
          setIsAdmin(false);
          setCustomerProfile(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();

    let authUser: User;
    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
      authUser = result.user;
    } catch (primaryErr: any) {
      if (primaryErr?.code === 'auth/invalid-credential' && password.trim() !== password) {
        const retryResult = await signInWithEmailAndPassword(auth, cleanEmail, password.trim());
        authUser = retryResult.user;
      } else {
        throw primaryErr;
      }
    }

    setUser(authUser);

    // Verify if admin or sync as customer
    const isAuthAdmin = await verifyAdmin(authUser);
    if (!isAuthAdmin) {
      await syncProfile(authUser);
    }
  };

  const adminSignInWithEmail = async (email: string, password: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();

    let authUser: User;
    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
      authUser = result.user;
    } catch (primaryErr: any) {
      if (primaryErr?.code === 'auth/invalid-credential' && password.trim() !== password) {
        const retryResult = await signInWithEmailAndPassword(auth, cleanEmail, password.trim());
        authUser = retryResult.user;
      } else {
        throw primaryErr;
      }
    }

    // Strict email check: block any account other than gaugehouse1998@gmail.com
    if (!authUser.email || authUser.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      await fbSignOut(auth);
      setUser(null);
      setIsAdmin(false);
      throw new Error('Access Denied: Only the authorized administrator account is permitted to access the Staff Console.');
    }

    // Strict Firestore role check: must be active admin in admin_users/{uid}
    await ensureAdminRecord(authUser);
    const isAuthorized = await checkUserIsAdmin(authUser);
    if (!isAuthorized) {
      await fbSignOut(auth);
      setUser(null);
      setIsAdmin(false);
      throw new Error('Access Denied: Administrative record not found or deactivated in admin_users.');
    }

    setUser(authUser);
    setIsAdmin(true);
  };

  const registerWithEmail = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
  }): Promise<void> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const result = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);

    if (data.name.trim()) {
      try {
        await updateProfile(result.user, { displayName: data.name.trim() });
      } catch (err) {
        console.warn('Could not set displayName:', err);
      }
    }

    setUser(result.user);
    const profile = await syncCustomerOnAuth(result.user, {
      name: data.name.trim(),
      phone: data.phone?.trim(),
      address: data.address?.trim(),
      city: data.city?.trim(),
    });
    setCustomerProfile(profile);
    await verifyAdmin(result.user);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser(result.user);
        await verifyAdmin(result.user);
        await syncProfile(result.user);
      }
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.message?.includes('popup-closed-by-user') ||
        error?.message?.includes('cancelled-popup-request')
      ) {
        return;
      }
      console.error('Sign-in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setCustomerProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshAdminStatus = async () => {
    if (user) {
      await verifyAdmin(user);
      await syncProfile(user);
    }
  };

  const updateCustomerData = async (data: Partial<CustomerUser>) => {
    if (!user) throw new Error('No authenticated user');
    await saveCustomerProfile({ ...data, uid: user.uid });
    setCustomerProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const deleteAccount = async () => {
    if (!user) return;
    const uid = user.uid;
    try {
      await deleteCustomerAccountInFirestore(uid);
      await fbSignOut(auth);
      setUser(null);
      setCustomerProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customerProfile,
        loading,
        isAdmin,
        signInWithEmail,
        adminSignInWithEmail,
        registerWithEmail,
        signInWithGoogle,
        signOut,
        refreshAdminStatus,
        updateCustomerData,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
