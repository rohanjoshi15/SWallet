import React, { useState } from 'react';
import { Send, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { StorageService } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { hybridEncrypt, importPublicKey, signData, generateSigningKeyPair } from '../lib/crypto';
import { useToast } from '../hooks/use-toast';
import type { Transaction } from '../lib/types';

interface SendFundsProps {
  onNavigate: (page: string) => void;
}

export const SendFunds: React.FC<SendFundsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: '',
    amount: '',
    note: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const recipient = StorageService.getUserByEmail(formData.recipientEmail);
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      if (recipient.id === user.id) {
        throw new Error('Cannot send funds to yourself');
      }

      const amount = Math.round(parseFloat(formData.amount) * 100);
      if (amount <= 0 || isNaN(amount)) {
        throw new Error('Invalid amount');
      }

      const senderWallet = StorageService.getWalletByUserId(user.id);
      if (!senderWallet || senderWallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      if (!recipient.publicKey) {
        throw new Error('Recipient has not set up encryption keys');
      }

      const recipientPublicKey = await importPublicKey(recipient.publicKey);

      const transactionData = JSON.stringify({
        senderId: user.id,
        recipientId: recipient.id,
        amount,
        timestamp: new Date().toISOString(),
        note: formData.note,
      });

      const { encryptedData, encryptedKey, iv } = await hybridEncrypt(
        transactionData,
        recipientPublicKey
      );

      const signingKeyPair = await generateSigningKeyPair();
      const signature = await signData(transactionData, signingKeyPair.privateKey);

      const transaction: Transaction = {
        id: `tx_${Date.now()}`,
        senderId: user.id,
        senderEmail: user.email,
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        amount,
        encryptedData: JSON.stringify({ encryptedData, encryptedKey, iv }),
        signature,
        status: 'completed',
        note: formData.note,
        createdAt: new Date().toISOString(),
      };

      StorageService.saveTransaction(transaction);

      const updatedSenderWallet = {
        ...senderWallet,
        balance: senderWallet.balance - amount,
        updatedAt: new Date().toISOString(),
      };
      StorageService.saveWallet(updatedSenderWallet);

      const recipientWallet = StorageService.getWalletByUserId(recipient.id);
      if (recipientWallet) {
        const updatedRecipientWallet = {
          ...recipientWallet,
          balance: recipientWallet.balance + amount,
          updatedAt: new Date().toISOString(),
        };
        StorageService.saveWallet(updatedRecipientWallet);
      }

      toast({
        title: 'Transaction Successful',
        description: `Sent $${(amount / 100).toFixed(2)} to ${recipient.email}`,
      });

      setFormData({ recipientEmail: '', amount: '', note: '' });
      setTimeout(() => onNavigate('dashboard'), 1500);
    } catch (error) {
      toast({
        title: 'Transaction Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Send Funds</h1>
        <p className="text-gray-600">Send encrypted peer-to-peer payments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Transfer Details
          </CardTitle>
          <CardDescription>All transactions are end-to-end encrypted</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="recipient@example.com"
                value={formData.recipientEmail}
                onChange={e => setFormData({ ...formData, recipientEmail: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note to this transaction"
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
                rows={3}
              />
            </div>

            <div className="rounded-lg border bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    Secure End-to-End Encryption
                  </p>
                  <p className="text-sm text-blue-700">
                    This transaction will be encrypted using RSA/AES hybrid encryption and digitally
                    signed for authenticity.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Encrypt & Send
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-50 to-white">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Transaction Encrypted</p>
              <p className="text-sm text-gray-600">
                Your transaction is encrypted using the recipient's public key
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Digital Signature</p>
              <p className="text-sm text-gray-600">
                Transaction is signed with your private key for verification
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Secure Transfer</p>
              <p className="text-sm text-gray-600">
                Funds are transferred securely and cannot be intercepted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
