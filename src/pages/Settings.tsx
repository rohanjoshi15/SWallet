import React, { useState } from 'react';
import { User, Lock, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { StorageService } from '../lib/storage';
import { generateRSAKeyPair, exportPublicKey, exportPrivateKey } from '../lib/crypto';
import { useToast } from '../hooks/use-toast';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [regeneratingKeys, setRegeneratingKeys] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();

    updateUser({
      fullName: profileData.fullName,
      email: profileData.email,
    });

    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been updated successfully',
    });
  };

  const handleRegenerateKeys = async () => {
    if (!user) return;

    setRegeneratingKeys(true);

    try {
      const keyPair = await generateRSAKeyPair();
      const publicKey = await exportPublicKey(keyPair.publicKey);
      const privateKey = await exportPrivateKey(keyPair.privateKey);

      updateUser({ publicKey });

      StorageService.saveUserKeys(user.id, { publicKey, privateKey });

      toast({
        title: 'Keys Regenerated',
        description: 'New RSA key pair has been generated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate keys',
        variant: 'destructive',
      });
    } finally {
      setRegeneratingKeys(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and security settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={profileData.fullName}
                onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Update Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" placeholder="Enter current password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" placeholder="Enter new password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
            </div>

            <Button variant="outline">Change Password</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Encryption Keys
          </CardTitle>
          <CardDescription>Manage your RSA encryption keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-gray-50 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-900">Public Key Status</p>
            <p className="text-xs text-gray-600 break-all font-mono">
              {user?.publicKey ? user.publicKey.substring(0, 64) + '...' : 'No public key set'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  user?.publicKey ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-gray-600">
                {user?.publicKey ? 'Active' : 'Not configured'}
              </span>
            </div>
          </div>

          <div className="rounded-lg border bg-yellow-50 p-4">
            <p className="text-sm font-medium text-yellow-900 mb-2">Warning</p>
            <p className="text-sm text-yellow-700">
              Regenerating keys will create a new RSA key pair. Previous encrypted messages may
              become inaccessible.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleRegenerateKeys}
            disabled={regeneratingKeys}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            {regeneratingKeys ? 'Regenerating...' : 'Regenerate Keys'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-900">
              Deleting your account will permanently remove all your data, including wallet balance,
              transactions, and tokens. This action cannot be undone.
            </p>
          </div>
          <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
};
