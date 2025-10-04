import type { User, Wallet, Transaction, Token, StoredKeys } from './types';

const STORAGE_KEYS = {
  USERS: 'swallet_users',
  WALLETS: 'swallet_wallets',
  TRANSACTIONS: 'swallet_transactions',
  TOKENS: 'swallet_tokens',
  CURRENT_USER: 'swallet_current_user',
  USER_KEYS: 'swallet_user_keys',
};

export class StorageService {
  private static getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  private static setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static getAllUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS) || [];
  }

  static saveUser(user: User): void {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  static getUserByEmail(email: string): User | undefined {
    return this.getAllUsers().find(u => u.email === email);
  }

  static getUserById(id: string): User | undefined {
    return this.getAllUsers().find(u => u.id === id);
  }

  static getCurrentUser(): User | null {
    const userId = this.getItem<string>(STORAGE_KEYS.CURRENT_USER);
    return userId ? this.getUserById(userId) || null : null;
  }

  static setCurrentUser(userId: string | null): void {
    if (userId) {
      this.setItem(STORAGE_KEYS.CURRENT_USER, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  static getAllWallets(): Wallet[] {
    return this.getItem<Wallet[]>(STORAGE_KEYS.WALLETS) || [];
  }

  static getWalletByUserId(userId: string): Wallet | undefined {
    return this.getAllWallets().find(w => w.userId === userId);
  }

  static saveWallet(wallet: Wallet): void {
    const wallets = this.getAllWallets();
    const index = wallets.findIndex(w => w.id === wallet.id);
    if (index >= 0) {
      wallets[index] = wallet;
    } else {
      wallets.push(wallet);
    }
    this.setItem(STORAGE_KEYS.WALLETS, wallets);
  }

  static getAllTransactions(): Transaction[] {
    return this.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
  }

  static getTransactionsByUserId(userId: string): Transaction[] {
    return this.getAllTransactions().filter(
      t => t.senderId === userId || t.recipientId === userId
    );
  }

  static saveTransaction(transaction: Transaction): void {
    const transactions = this.getAllTransactions();
    transactions.unshift(transaction);
    this.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  static updateTransaction(transactionId: string, updates: Partial<Transaction>): void {
    const transactions = this.getAllTransactions();
    const index = transactions.findIndex(t => t.id === transactionId);
    if (index >= 0) {
      transactions[index] = { ...transactions[index], ...updates };
      this.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
    }
  }

  static getAllTokens(): Token[] {
    return this.getItem<Token[]>(STORAGE_KEYS.TOKENS) || [];
  }

  static getTokensByUserId(userId: string): Token[] {
    return this.getAllTokens().filter(t => t.userId === userId);
  }

  static saveToken(token: Token): void {
    const tokens = this.getAllTokens();
    tokens.push(token);
    this.setItem(STORAGE_KEYS.TOKENS, tokens);
  }

  static deleteToken(tokenId: string): void {
    const tokens = this.getAllTokens().filter(t => t.id !== tokenId);
    this.setItem(STORAGE_KEYS.TOKENS, tokens);
  }

  static saveUserKeys(userId: string, keys: StoredKeys): void {
    const allKeys = this.getItem<Record<string, StoredKeys>>(STORAGE_KEYS.USER_KEYS) || {};
    allKeys[userId] = keys;
    this.setItem(STORAGE_KEYS.USER_KEYS, allKeys);
  }

  static getUserKeys(userId: string): StoredKeys | null {
    const allKeys = this.getItem<Record<string, StoredKeys>>(STORAGE_KEYS.USER_KEYS) || {};
    return allKeys[userId] || null;
  }

  static clearCurrentSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  static initializeSampleData(): void {
    if (this.getAllUsers().length === 0) {
      const sampleUser1: User = {
        id: 'user1',
        email: 'john@example.com',
        fullName: 'John Doe',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
      };

      const sampleUser2: User = {
        id: 'user2',
        email: 'jane@example.com',
        fullName: 'Jane Smith',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
      };

      this.saveUser(sampleUser1);
      this.saveUser(sampleUser2);

      const wallet1: Wallet = {
        id: 'wallet1',
        userId: 'user1',
        balance: 5000,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const wallet2: Wallet = {
        id: 'wallet2',
        userId: 'user2',
        balance: 3500,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.saveWallet(wallet1);
      this.saveWallet(wallet2);
    }
  }
}
