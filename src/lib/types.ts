export interface User {
  id: string;
  email: string;
  fullName: string;
  publicKey?: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  senderId: string;
  senderEmail: string;
  recipientId: string;
  recipientEmail: string;
  amount: number;
  encryptedData?: string;
  signature?: string;
  status: 'pending' | 'completed' | 'failed';
  note?: string;
  createdAt: string;
}

export interface Token {
  id: string;
  userId: string;
  token: string;
  encryptedData: string;
  tokenType: string;
  lastFour?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface StoredKeys {
  publicKey: string;
  privateKey: string;
}
