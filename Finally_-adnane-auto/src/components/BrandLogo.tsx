import React, { useEffect, useState } from 'react';

interface BrandLogoProps {
  variant?: 'original' | 'light' | 'dark' | 'transparent-dark';
  className?: string;
  height?: number | string;
  customLogoUrl?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'original',
  className = '',
  height,
  customLogoUrl
}) => {
  const isDark = variant === 'dark' || variant === 'transparent-dark';
  const [currentLogo, setCurrentLogo] = useState<string>('');

  useEffect(() => {
    if (customLogoUrl !== undefined) {
      setCurrentLogo(customLogoUrl);
    } else {
      const stored = localStorage.getItem('showroom_custom_logo');
      setCurrentLogo(stored || '');
    }

    // Listen for custom storage changes across tabs or inside CMS
    const handleStorageChange = () => {
      const updated = localStorage.getItem('showroom_custom_logo');
      setCurrentLogo(updated || '');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('showroom_logo_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('showroom_logo_updated', handleStorageChange);
    };
  }, [customLogoUrl]);

  return (
    <div 
      className={`flex items-center shrink-0 ${className} select-none`} 
      style={height ? { height } : undefined}
    >
      {currentLogo ? (
        <div className={`h-full flex items-center justify-center ${isDark ? 'bg-white/95 p-1 rounded-xl shadow-xs border border-white/20' : ''}`}>
          <img 
            src={currentLogo} 
            alt="ADNANE AUTO MARRAKECH" 
            referrerPolicy="no-referrer"
            className="h-full w-auto object-contain max-h-full rounded-lg"
          />
        </div>
      ) : (
        <div className="flex flex-col text-left font-sans">
          <span className={`text-lg font-black tracking-wider leading-none ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            ADNANE <span className="text-rose-500">AUTO</span>
          </span>
          <span className={`text-[10px] font-bold tracking-[0.2em] uppercase leading-none mt-1 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            MARRAKECH
          </span>
        </div>
      )}
    </div>
  );
};


