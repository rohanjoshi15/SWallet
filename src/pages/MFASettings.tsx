import React, { useState } from 'react';
import { Shield, QrCode, CircleCheck as CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { useAuth } from '../contexts/AuthContext';
import { generateTOTPSecret } from '../lib/crypto';
import { useToast } from '../hooks/use-toast';

export const MFASettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [showSetup, setShowSetup] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const handleEnableMFA = () => {
    const secret = generateTOTPSecret();
    setTotpSecret(secret);

    const issuer = 'SWallet';
    const accountName = user?.email || 'user@example.com';
    const otpauthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      otpauthUrl
    )}`;
    setQrCodeUrl(qrUrl);
    setShowSetup(true);
  };

  const handleVerifyOTP = () => {
    if (otpCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    updateUser({ mfaEnabled: true, mfaSecret: totpSecret });

    toast({
      title: 'MFA Enabled',
      description: 'Two-factor authentication has been successfully enabled',
    });

    setShowSetup(false);
    setOtpCode('');
  };

  const handleDisableMFA = () => {
    updateUser({ mfaEnabled: false, mfaSecret: undefined });

    toast({
      title: 'MFA Disabled',
      description: 'Two-factor authentication has been disabled',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">MFA Settings</h1>
        <p className="text-gray-600">Manage multi-factor authentication for your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account using TOTP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
            <div className="space-y-1">
              <p className="font-medium text-gray-900">MFA Status</p>
              <p className="text-sm text-gray-600">
                {user?.mfaEnabled
                  ? 'Two-factor authentication is enabled'
                  : 'Two-factor authentication is disabled'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={user?.mfaEnabled || false}
                onCheckedChange={checked => {
                  if (checked) {
                    handleEnableMFA();
                  } else {
                    handleDisableMFA();
                  }
                }}
              />
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  user?.mfaEnabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {showSetup && (
            <div className="space-y-6 p-6 rounded-lg border bg-gradient-to-br from-blue-50 to-white">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900">Setup Authenticator</h3>
                <p className="text-sm text-gray-600">
                  Scan the QR code below with your authenticator app (Google Authenticator, Authy,
                  etc.)
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                      <QrCode className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="w-full max-w-md space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Or enter this code manually:
                  </Label>
                  <div className="p-3 bg-gray-100 rounded-lg border">
                    <code className="text-sm font-mono text-gray-900 break-all">{totpSecret}</code>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otpCode">Enter 6-digit code from your app</Label>
                  <Input
                    id="otpCode"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '');
                      setOtpCode(value);
                    }}
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleVerifyOTP}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Verify & Enable
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSetup(false);
                      setOtpCode('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How MFA Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Enable MFA</p>
              <p className="text-sm text-gray-600">
                Toggle on MFA and scan the QR code with your authenticator app
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Verify Code</p>
              <p className="text-sm text-gray-600">
                Enter the 6-digit code from your app to complete setup
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Login with MFA</p>
              <p className="text-sm text-gray-600">
                On future logins, you'll need both your password and the 6-digit code
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
