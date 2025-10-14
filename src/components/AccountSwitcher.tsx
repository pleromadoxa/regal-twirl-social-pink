
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Users, User, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';

interface AccountSwitcherProps {
  selectedAccount: 'personal' | string;
  onAccountChange: (account: 'personal' | string) => void;
}

const AccountSwitcher = ({ selectedAccount, onAccountChange }: AccountSwitcherProps) => {
  const { user } = useAuth();
  const { myPages } = useBusinessPages(); // Only show user's own pages

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'organization':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'professional':
        return <User className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!user) return null;

  return (
    <div className="mb-4">
      <Select value={selectedAccount} onValueChange={onAccountChange}>
        <SelectTrigger className="w-full max-w-[200px] sm:max-w-xs border-purple-200 focus:border-purple-500 bg-white/80 dark:bg-slate-800/80">
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="personal">
            <div className="flex items-center gap-3">
              <Avatar className="w-6 h-6">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>Personal Account</span>
            </div>
          </SelectItem>
          
          {myPages.map((page) => (
            <SelectItem key={page.id} value={page.id}>
              <div className="flex items-center gap-3">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={page.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                    {page.page_name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  {getAccountIcon(page.page_type)}
                  <span>{page.page_name}</span>
                  {page.is_verified && (
                    <Crown className="w-3 h-3 text-blue-500" />
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AccountSwitcher;
