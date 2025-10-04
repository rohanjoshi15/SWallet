import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StorageService } from '../lib/storage';
import { hashPassword, generateRSAKeyPair, exportPublicKey, exportPrivateKey } from '../lib/crypto';
import type { User, StoredKeys } from '../lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StorageService.initializeSampleData();
    const currentUser = StorageService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const register = async (email: string, password: string, fullName: string) => {
    const existingUser = StorageService.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await hashPassword(password);
    const keyPair = await generateRSAKeyPair();
    const publicKey = await exportPublicKey(keyPair.publicKey);
    const privateKey = await exportPrivateKey(keyPair.privateKey);

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      fullName,
      publicKey,
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
    };

    StorageService.saveUser(newUser);

    const keys: StoredKeys = { publicKey, privateKey };
    StorageService.saveUserKeys(newUser.id, keys);

    const newWallet = {
      id: `wallet_${Date.now()}`,
      userId: newUser.id,
      balance: 1000,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageService.saveWallet(newWallet);

    localStorage.setItem(`swallet_password_${newUser.id}`, passwordHash);

    StorageService.setCurrentUser(newUser.id);
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    const user = StorageService.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordHash = await hashPassword(password);
    const storedHash = localStorage.getItem(`swallet_password_${user.id}`);

    if (passwordHash !== storedHash) {
      throw new Error('Invalid credentials');
    }

    StorageService.setCurrentUser(user.id);
    setUser(user);
  };

  const logout = () => {
    StorageService.clearCurrentSession();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    StorageService.saveUser(updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
