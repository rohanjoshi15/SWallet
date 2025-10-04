import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { StorageService } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { generateToken, generateAESKey, encryptWithAES } from '../lib/crypto';
import { useToast } from '../hooks/use-toast';
import type { Token } from '../lib/types';

export const Tokenize: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    if (user) {
      const userTokens = StorageService.getTokensByUserId(user.id);
      setTokens(userTokens);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const cardData = JSON.stringify({
        cardNumber: formData.cardNumber,
        cardHolder: formData.cardHolder,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
      });

      const aesKey = await generateAESKey();
      const { encrypted, iv } = await encryptWithAES(cardData, aesKey);

      const token: Token = {
        id: `token_${Date.now()}`,
        userId: user.id,
        token: `tok_${generateToken(16)}`,
        encryptedData: JSON.stringify({ encrypted, iv }),
        tokenType: 'card',
        lastFour: formData.cardNumber.slice(-4),
        createdAt: new Date().toISOString(),
      };

      StorageService.saveToken(token);
      setTokens([...tokens, token]);

      toast({
        title: 'Card Tokenized Successfully',
        description: 'Your card information has been securely tokenized',
      });

      setFormData({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
    } catch (error) {
      toast({
        title: 'Tokenization Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (tokenId: string) => {
    StorageService.deleteToken(tokenId);
    setTokens(tokens.filter(t => t.id !== tokenId));
    toast({
      title: 'Token Deleted',
      description: 'The token has been removed',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Tokenize Card</h1>
        <p className="text-gray-600">Securely tokenize sensitive payment information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Card Information
            </CardTitle>
            <CardDescription>Enter card details to generate a secure token</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={formData.cardNumber}
                  onChange={e => {
                    const value = e.target.value.replace(/\s/g, '');
                    if (/^\d*$/.test(value) && value.length <= 16) {
                      setFormData({ ...formData, cardNumber: value });
                    }
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardHolder">Card Holder Name</Label>
                <Input
                  id="cardHolder"
                  type="text"
                  placeholder="John Doe"
                  value={formData.cardHolder}
                  onChange={e => setFormData({ ...formData, cardHolder: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={formData.expiryDate}
                    onChange={e => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      setFormData({ ...formData, expiryDate: value });
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    maxLength={4}
                    value={formData.cvv}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, cvv: value });
                    }}
                    required
                  />
                </div>
              </div>

              <div className="rounded-lg border bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">AES-256 Encryption</p>
                    <p className="text-sm text-blue-700">
                      Card data is encrypted before storage. Only tokens are used in transactions.
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
                {loading ? 'Processing...' : 'Generate Token'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Tokens</CardTitle>
            <CardDescription>Manage tokenized cards</CardDescription>
          </CardHeader>
          <CardContent>
            {tokens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tokens yet. Tokenize a card to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {tokens.map(token => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          •••• •••• •••• {token.lastFour}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(token.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="text-xs font-mono text-gray-500">{token.token}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(token.id)}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
