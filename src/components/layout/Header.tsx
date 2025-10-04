import React from 'react';
import { Wallet, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface HeaderProps {
  balance: number;
}

export const Header: React.FC<HeaderProps> = ({ balance }) => {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-blue-900">SWallet</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100/50 px-4 py-2">
            <Wallet className="h-4 w-4 text-blue-700" />
            <span className="text-sm font-medium text-gray-600">Balance:</span>
            <span className="text-lg font-bold text-blue-900">
              ${(balance / 100).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-blue-200">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm">
                {user ? getInitials(user.fullName) : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>

            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
