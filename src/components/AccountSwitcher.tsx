
import { useState } from 'react';
import { ChevronDown, User, Building, Users, Crown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { useNavigate } from 'react-router-dom';

interface AccountSwitcherProps {
  selectedAccount: 'personal' | string;
  onAccountChange: (accountId: 'personal' | string) => void;
}

const AccountSwitcher = ({ selectedAccount, onAccountChange }: AccountSwitcherProps) => {
  const { user } = useAuth();
  const { myPages } = useBusinessPages();
  const navigate = useNavigate();

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <Building className="w-4 h-4" />;
      case 'organization':
        return <Users className="w-4 h-4" />;
      case 'professional':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getSelectedAccountInfo = () => {
    if (selectedAccount === 'personal') {
      return {
        name: user?.email?.split('@')[0] || 'Personal',
        type: 'Personal Account',
        icon: <User className="w-4 h-4" />,
        avatar: null
      };
    }
    
    const page = myPages.find(p => p.id === selectedAccount);
    if (page) {
      return {
        name: page.page_name,
        type: page.page_type.charAt(0).toUpperCase() + page.page_type.slice(1),
        icon: getAccountIcon(page.page_type),
        avatar: page.avatar_url,
        isVerified: page.is_verified
      };
    }
    
    return {
      name: 'Unknown Account',
      type: 'Account',
      icon: <User className="w-4 h-4" />,
      avatar: null
    };
  };

  const selectedInfo = getSelectedAccountInfo();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between px-3 py-2 h-auto hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={selectedInfo.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                {selectedInfo.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {selectedInfo.name}
                </span>
                {selectedInfo.isVerified && (
                  <Crown className="w-3 h-3 text-blue-500" />
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {selectedInfo.type}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-purple-200 dark:border-purple-800">
        <DropdownMenuItem
          onClick={() => onAccountChange('personal')}
          className={`cursor-pointer rounded-lg ${
            selectedAccount === 'personal' ? 'bg-purple-50 dark:bg-purple-900/30' : ''
          }`}
        >
          <div className="flex items-center gap-3 w-full">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                {user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {user?.email?.split('@')[0] || 'Personal'}
              </span>
              <span className="text-xs text-slate-500">Personal Account</span>
            </div>
          </div>
        </DropdownMenuItem>
        
        {myPages.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {myPages.map((page) => (
              <DropdownMenuItem
                key={page.id}
                onClick={() => onAccountChange(page.id)}
                className={`cursor-pointer rounded-lg ${
                  selectedAccount === page.id ? 'bg-purple-50 dark:bg-purple-900/30' : ''
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={page.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                      {page.page_name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{page.page_name}</span>
                      {page.is_verified && (
                        <Crown className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {getAccountIcon(page.page_type)}
                      <span className="text-xs text-slate-500">
                        {page.page_type.charAt(0).toUpperCase() + page.page_type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate('/professional')}
          className="cursor-pointer rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Manage Professional Accounts
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Create and manage business accounts
              </span>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountSwitcher;
