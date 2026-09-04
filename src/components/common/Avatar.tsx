// ============================================================================
// MingleUp Avatar Component
// Rounded user photo with online status indicator and verified badge
// ============================================================================

import React from 'react';
import { Check } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isOnline?: boolean;
  isVerified?: boolean;
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-3xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  isOnline,
  isVerified,
  className = '',
  onClick,
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div 
      className={`relative inline-block flex-shrink-0 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div 
        className={`${SIZE_MAP[size]} rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-md bg-gradient-to-tr from-brand-600 to-rose-500 flex items-center justify-center text-white font-bold select-none`}
      >
        {src ? (
          <img 
            src={src} 
            alt={name} 
            className="w-full h-full object-cover" 
            loading="lazy"
            onError={(e) => {
              // fallback to initials on broken image
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Online indicator dot */}
      {isOnline !== undefined && (
        <span 
          className={`absolute bottom-0 end-0 rounded-full border-2 border-white dark:border-slate-900 ${
            isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
          } ${
            size === 'xs' || size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}

      {/* Verified badge */}
      {isVerified && (
        <span 
          className={`absolute top-0 end-0 bg-blue-500 text-white rounded-full p-0.5 shadow-sm border border-white dark:border-slate-900 flex items-center justify-center ${
            size === 'xs' || size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'
          }`}
          title="Verified Account"
        >
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
      )}
    </div>
  );
};
