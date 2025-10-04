export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface SerializedKeyPair {
  publicKey: string;
  privateKey: string;
}

export async function generateRSAKeyPair(): Promise<KeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  return keyPair;
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  return arrayBufferToBase64(exported);
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('pkcs8', key);
  return arrayBufferToBase64(exported);
}

export async function importPublicKey(keyData: string): Promise<CryptoKey> {
  const buffer = base64ToArrayBuffer(keyData);
  return await window.crypto.subtle.importKey(
    'spki',
    buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
}

export async function importPrivateKey(keyData: string): Promise<CryptoKey> {
  const buffer = base64ToArrayBuffer(keyData);
  return await window.crypto.subtle.importKey(
    'pkcs8',
    buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt']
  );
}

export async function generateAESKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptWithAES(
  data: string,
  key: CryptoKey
): Promise<{ encrypted: string; iv: string }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(data);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
  };
}

export async function decryptWithAES(
  encryptedData: string,
  key: CryptoKey,
  iv: string
): Promise<string> {
  const encrypted = base64ToArrayBuffer(encryptedData);
  const ivBuffer = base64ToArrayBuffer(iv);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

export async function encryptWithRSA(data: string, publicKey: CryptoKey): Promise<string> {
  const encodedData = new TextEncoder().encode(data);
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    encodedData
  );

  return arrayBufferToBase64(encrypted);
}

export async function decryptWithRSA(encryptedData: string, privateKey: CryptoKey): Promise<string> {
  const encrypted = base64ToArrayBuffer(encryptedData);
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

export async function hybridEncrypt(
  data: string,
  recipientPublicKey: CryptoKey
): Promise<{ encryptedData: string; encryptedKey: string; iv: string }> {
  const aesKey = await generateAESKey();
  const { encrypted, iv } = await encryptWithAES(data, aesKey);

  const exportedAESKey = await window.crypto.subtle.exportKey('raw', aesKey);
  const encryptedKey = await encryptWithRSA(arrayBufferToBase64(exportedAESKey), recipientPublicKey);

  return {
    encryptedData: encrypted,
    encryptedKey: encryptedKey,
    iv: iv,
  };
}

export async function hybridDecrypt(
  encryptedData: string,
  encryptedKey: string,
  iv: string,
  privateKey: CryptoKey
): Promise<string> {
  const decryptedKeyBase64 = await decryptWithRSA(encryptedKey, privateKey);
  const aesKeyBuffer = base64ToArrayBuffer(decryptedKeyBase64);

  const aesKey = await window.crypto.subtle.importKey(
    'raw',
    aesKeyBuffer,
    {
      name: 'AES-GCM',
    },
    false,
    ['decrypt']
  );

  return await decryptWithAES(encryptedData, aesKey, iv);
}

export async function generateSigningKeyPair() {
  return await window.crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  );
}

export async function signData(data: string, privateKey: CryptoKey): Promise<string> {
  const encodedData = new TextEncoder().encode(data);
  const signature = await window.crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    encodedData
  );

  return arrayBufferToBase64(signature);
}

export async function verifySignature(
  data: string,
  signature: string,
  publicKey: CryptoKey
): Promise<boolean> {
  const encodedData = new TextEncoder().encode(data);
  const signatureBuffer = base64ToArrayBuffer(signature);

  return await window.crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    publicKey,
    signatureBuffer,
    encodedData
  );
}

export function generateToken(length: number = 16): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function generateTOTPSecret(): string {
  const array = new Uint8Array(20);
  window.crypto.getRandomValues(array);
  return base32Encode(array);
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hash);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function base32Encode(buffer: Uint8Array): string {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += base32Chars[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += base32Chars[(value << (5 - bits)) & 31];
  }

  return output;
}
