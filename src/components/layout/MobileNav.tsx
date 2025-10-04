import React from 'react';
import { LayoutDashboard, Send, CreditCard, Settings, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'send', label: 'Send', icon: Send },
  { id: 'tokenize', label: 'Card', icon: CreditCard },
  { id: 'mfa', label: 'Security', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all',
                isActive
                  ? 'text-blue-700'
                  : 'text-gray-600'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
