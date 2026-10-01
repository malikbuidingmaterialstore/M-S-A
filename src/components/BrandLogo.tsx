import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
}) => {
  const sizeMap = {
    xs: { width: 'max-w-[120px]', height: 'max-h-10', iconSize: 'w-8 h-8' },
    sm: { width: 'max-w-[170px]', height: 'max-h-14', iconSize: 'w-10 h-10' },
    md: { width: 'max-w-[260px]', height: 'max-h-24', iconSize: 'w-14 h-14' },
    lg: { width: 'max-w-[340px]', height: 'max-h-32', iconSize: 'w-20 h-20' },
    xl: { width: 'max-w-[440px]', height: 'max-h-44', iconSize: 'w-28 h-28' },
  }[size];

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        <img
          src="/src/assets/images/msa_icon_transparent.png"
          alt="MSA"
          referrerPolicy="no-referrer"
          className={`${sizeMap.iconSize} object-contain`}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* 
        Exact Official MSA Brand Logo (Transparent Background)
        Features 3D Ribbon Emblem, Skyline, House Roof, MSA Typography, 
        and MANAGED | SEARCH | ACCESS tagline with pure transparent background.
      */}
      <div className={`relative ${sizeMap.width} w-full flex items-center justify-center`}>
        <img
          src="/src/assets/images/msa_logo_transparent.png"
          alt="MSA — MANAGED | SEARCH | ACCESS"
          referrerPolicy="no-referrer"
          className="w-full h-auto object-contain filter drop-shadow-[0_4px_12px_rgba(2,132,199,0.2)]"
        />
      </div>
    </div>
  );
};
