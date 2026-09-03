import React from 'react';

export type HeaderMarkSize =
  | '16px'
  | '24px'
  | '32px'
  | '48px'
  | '64px'
  | '128px'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl';

interface HeaderMarkProps {
  size?: HeaderMarkSize;
  showText?: boolean;
  isArabic?: boolean;
  isDark?: boolean;
  className?: string;
  badgeText?: string;
}

export const HeaderMark: React.FC<HeaderMarkProps> = ({
  size = 'md',
  showText = true,
  isArabic = false,
  isDark = false,
  className = '',
  badgeText,
}) => {
  const getDimensionClasses = (s: string) => {
    switch (s) {
      case '16px':
      case 'xs':
        return 'w-4 h-4 rounded-md p-0.5';
      case '24px':
      case 'xs-sm':
        return 'w-6 h-6 rounded-lg p-1';
      case '32px':
      case 'sm':
        return 'w-8 h-8 rounded-xl p-1.5';
      case '48px':
      case 'md':
        return 'w-10 h-10 rounded-2xl p-2';
      case '64px':
      case 'lg':
      case 'xl':
        return 'w-16 h-16 rounded-[22px] p-3';
      case '128px':
      case '2xl':
        return 'w-32 h-32 rounded-[36px] p-6 shadow-2xl';
      default:
        return 'w-10 h-10 rounded-2xl p-2';
    }
  };

  const isMicro = size === '16px' || size === 'xs' || size === '24px';
  const isLarge = size === '128px' || size === '2xl';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Bespoke Cloche / Chef Head Silhouette in Lantern Red (#A13D2D) */}
      <div
        className={`relative flex items-center justify-center bg-lantern-red text-evening-cream shadow-sm flex-shrink-0 transition-transform hover:scale-105 ${getDimensionClasses(
          size
        )}`}
        style={{ backgroundColor: '#A13D2D' }}
        title="FeastCraft Artisanal Brand Mark"
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-evening-cream"
        >
          {/* Chef Toque Finial */}
          <circle
            cx="24"
            cy="9"
            r={isMicro ? '3.5' : '2.5'}
            fill="#F1DED0"
            stroke="#F1DED0"
            strokeWidth={isMicro ? '2' : '1'}
          />

          {/* Cloche Dome & Chef Toque Silhouette */}
          <path
            d="M10 28C10 18.5 16.5 12 24 12C31.5 12 38 18.5 38 28"
            stroke="#F1DED0"
            strokeWidth={isMicro ? '4' : isLarge ? '2.5' : '3'}
            strokeLinecap="round"
          />

          {/* Architectural arches inside cloche */}
          {!isMicro && (
            <path
              d="M17 28C17 22 20 18 24 18C28 18 31 22 31 28"
              stroke="#F1DED0"
              strokeWidth={isLarge ? '1.5' : '1.8'}
              strokeLinecap="round"
              strokeDasharray={isLarge ? '2 2' : '1 2'}
              opacity="0.8"
            />
          )}

          {/* Serving Platter Base Rim */}
          <path
            d="M6 31H42"
            stroke="#F1DED0"
            strokeWidth={isMicro ? '4.5' : '3'}
            strokeLinecap="round"
          />

          {/* Secondary Platter Level */}
          {!isMicro && (
            <path
              d="M12 35H36"
              stroke="#F1DED0"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.85"
            />
          )}

          {/* Chef Diamond Monogram Accent */}
          {!isMicro && (
            <path
              d="M24 37.5L21.5 40.5H26.5L24 37.5Z"
              fill="#F1DED0"
            />
          )}
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-start">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold tracking-tight font-display ${
                size === '128px'
                  ? 'text-3xl sm:text-4xl'
                  : size === '64px'
                  ? 'text-2xl'
                  : 'text-lg'
              } leading-tight ${
                isDark ? 'text-evening-cream' : 'text-temple-brown'
              }`}
            >
              {isArabic ? 'فيست كرافت' : 'FeastCraft'}
            </span>
            {badgeText && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lantern-red/10 text-lantern-red">
                {badgeText}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] tracking-widest uppercase font-semibold font-sans ${
              isDark ? 'text-stone-gray' : 'text-stone-gray'
            }`}
          >
            {isArabic ? 'بيتزا كرافت وبرجر سماش سريع' : 'Fast-Casual Artisanal Kitchen'}
          </span>
        </div>
      )}
    </div>
  );
};
