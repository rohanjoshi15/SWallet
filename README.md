# SWallet - Secure Digital Wallet Platform

## 📌 Project Overview
SWallet is a **secure digital wallet application** built with React, TypeScript, and Vite.  
It demonstrates **end-to-end encryption**, **peer-to-peer fund transfers**, **multi-factor authentication**, and **card tokenization** – providing a modern and secure digital wallet experience.

---

## 🚀 Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Radix UI + shadcn/ui
- **State Management**: React Context API
- **Storage**: Browser localStorage (client-side only)
- **Cryptography**: Web Crypto API
- **Authentication**: Custom JWT-like system with MFA

---

## 🔐 Core Functionalities

### 1. User Authentication & Registration
- RSA key pair generated at registration  
- Passwords stored using **SHA-256 with salt**  
- MFA (TOTP) support for secure login  
- Persistent sessions

### 2. Wallet Management
- Real-time balance tracking  
- Transaction history logs  
- Multi-currency support (USD currently)  
- New users start with **$10.00**

### 3. Secure Fund Transfers
- Peer-to-peer payments  
- **Hybrid Encryption (RSA + AES)**  
- **Digital Signatures** for authenticity  
- Real-time updates after transactions

### 4. Card Tokenization
- AES-256 encrypted card storage  
- Unique token generation  
- PCI DSS–style compliance  
- View/delete tokenized cards

### 5. Multi-Factor Authentication (MFA)
- TOTP (RFC 6238 compliant)  
- QR code for setup with authenticator apps  
- Backup secret option

---

## 🗄 Database Structure (localStorage Simulation)

### Users
```ts
interface User {
  id: string;
  email: string;
  fullName: string;
  publicKey?: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  createdAt: string;
}
```

### Wallets
```ts
interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}
```

### Transactions
```ts
interface Transaction {
  id: string;
  senderId: string;
  recipientId: string;
  amount: number;
  encryptedData?: string;
  signature?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}
```

### Tokens
```ts
interface Token {
  id: string;
  userId: string;
  token: string;
  encryptedData: string;
  tokenType: string;
  lastFour?: string;
  createdAt: string;
  expiresAt?: string;
}
```

---

## 🔑 Encryption & Security

### Why Encryption?
Digital wallets handle **sensitive financial data**. Without encryption, attackers could steal card numbers, passwords, or transaction details.  
By using strong cryptography, SWallet ensures **confidentiality, integrity, and authenticity** of transactions.

### RSA (Asymmetric)
- **2048-bit RSA-OAEP with SHA-256**  
- Used for encrypting AES session keys  
- Provides secure **key exchange**

### AES-256 (Symmetric)
- **AES-GCM (Galois/Counter Mode)**  
- 256-bit key length (virtually unbreakable with current computing power)  
- Used for **fast and secure bulk data encryption**

### Hybrid Encryption
1. Generate random AES key  
2. Encrypt data with AES-256  
3. Encrypt AES key with recipient’s RSA public key  
4. Store both together securely  

This combines **RSA security** with **AES performance**.

### Digital Signatures
- RSASSA-PKCS1-v1_5 with SHA-256  
- Ensures transaction authenticity  
- Prevents tampering

### Password Security
- Hashed with SHA-256 + salt  
- Prevents plain-text storage  
- Protects against dictionary attacks

### MFA (TOTP)
- RFC 6238 compliant  
- Works with Google Authenticator, Authy  
- 30s time window

---

## ⚙️ Application Architecture
```
src/
├── components/       # UI components
├── contexts/         # Authentication context
├── hooks/            # Custom hooks
├── lib/              # Crypto, storage, utils
├── pages/            # App pages (Dashboard, Login, etc.)
└── App.tsx           # Entry point
```

---

## 🛡 Security Features
- ✅ End-to-End encryption  
- ✅ AES-256 & RSA-2048 hybrid system  
- ✅ Digital signatures  
- ✅ Multi-Factor Authentication  
- ✅ Tokenized card storage  

⚠ Limitations (current localStorage version):
- Data persists unless manually cleared  
- No server-side validation  
- Requires HTTPS for true network security  

---

## 📊 Sample Users
- **John Doe** (john@example.com) – $50.00 balance  
- **Jane Smith** (jane@example.com) – $35.00 balance  

Both wallets preloaded for testing transfers.

---

## 📥 Getting Started

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd SWallet
npm install
```

### 2. Run Dev Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to:
```
http://localhost:5173
```

---

## 📖 Summary
SWallet is a **fully client-side encrypted digital wallet** showcasing:  
- End-to-End encryption with **RSA + AES**  
- Secure authentication with **MFA**  
- **Card tokenization** for PCI-style compliance  
- Educational demo of modern **fintech-grade security** in a web app

---
