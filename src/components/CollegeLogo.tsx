import React, { useState } from 'react';

interface CollegeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  className = '',
  size = 'md',
  showBorder = true,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const selectedSize = sizeClasses[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-white ${
        showBorder ? 'ring-2 ring-blue-600/20 shadow-sm' : ''
      } ${selectedSize} ${className}`}
      title="วิทยาลัยอาชีวศึกษาแพร่ (Phrae Vocational College)"
    >
      {/* 1. Official College Emblem Image */}
      {!imageError && (
        <img
          src="/phrae-logo.png"
          alt="ตราสัญลักษณ์ วิทยาลัยอาชีวศึกษาแพร่ (Phrae Vocational College)"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-contain transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}

      {/* 2. Scalable Vector Graphic Fallback / Instant Placeholder */}
      {(!imageLoaded || imageError) && (
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <path
              id="topTextCurve"
              d="M 28 100 A 72 72 0 0 1 172 100"
              fill="none"
            />
            <path
              id="bottomTextCurve"
              d="M 172 100 A 72 72 0 0 1 28 100"
              fill="none"
            />
            <radialGradient id="goldGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </radialGradient>
            <linearGradient id="blueRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* Outer Border */}
          <circle cx="100" cy="100" r="96" fill="#ffffff" stroke="#1E40AF" strokeWidth="4" />
          <circle cx="100" cy="100" r="92" fill="none" stroke="#2563EB" strokeWidth="1.5" />

          {/* Inner Navy Disc */}
          <circle cx="100" cy="100" r="64" fill="#0C1B4A" stroke="#1E40AF" strokeWidth="3" />

          {/* Top Thai Text */}
          <text
            fontSize="13"
            fontWeight="bold"
            fill="#1E3A8A"
            fontFamily="'Prompt', 'Sarabun', sans-serif"
          >
            <textPath href="#topTextCurve" startOffset="50%" textAnchor="middle">
              วิทยาลัยอาชีวศึกษาแพร่
            </textPath>
          </text>

          {/* Bottom English Text */}
          <text
            fontSize="9.5"
            fontWeight="bold"
            fill="#1E3A8A"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            letterSpacing="0.5"
          >
            <textPath href="#bottomTextCurve" startOffset="50%" textAnchor="middle">
              PHRAE VOCATIONAL COLLEGE
            </textPath>
          </text>

          {/* Floral Flank Ornaments */}
          <g transform="translate(18, 93) scale(0.65)" fill="#EC4899" stroke="#9D174D" strokeWidth="0.8">
            <polygon points="10,0 13,7 20,10 13,13 10,20 7,13 0,10 7,7" fill="#F472B6" />
            <circle cx="10" cy="10" r="3" fill="#FBBF24" />
          </g>
          <g transform="translate(168, 93) scale(0.65)" fill="#EC4899" stroke="#9D174D" strokeWidth="0.8">
            <polygon points="10,0 13,7 20,10 13,13 10,20 7,13 0,10 7,7" fill="#F472B6" />
            <circle cx="10" cy="10" r="3" fill="#FBBF24" />
          </g>

          {/* Inner Buddhist Wheel & Pedestal (สอศ. Emblem) */}
          <g transform="translate(100, 102)">
            {/* Center Pedestal Base */}
            <path
              d="M -26 28 L 26 28 L 22 22 L -22 22 Z"
              fill="url(#goldGrad)"
              stroke="#78350F"
              strokeWidth="1"
            />
            <path
              d="M -20 22 L 20 22 L 15 14 L -15 14 Z"
              fill="url(#goldGrad)"
              stroke="#78350F"
              strokeWidth="0.8"
            />

            {/* Pedestal Arch */}
            <path
              d="M -18 14 C -28 -6, -20 -28, 0 -38 C 20 -28, 28 -6, 18 14 C 12 6, 8 2, 0 2 C -8 2, -12 6, -18 14 Z"
              fill="url(#goldGrad)"
              stroke="#78350F"
              strokeWidth="1"
            />

            {/* Center Dharma Wheel */}
            <circle cx="0" cy="-14" r="14" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.5" />
            <circle cx="0" cy="-14" r="4" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
            {/* Wheel Spokes */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="0"
                y1="-14"
                x2={14 * Math.cos((deg * Math.PI) / 180)}
                y2={-14 + 14 * Math.sin((deg * Math.PI) / 180)}
                stroke="#B45309"
                strokeWidth="1"
              />
            ))}

            {/* Thai Characters (ส นิ ทุ ม) */}
            <text x="-38" y="-18" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="'Prompt', sans-serif" textAnchor="middle">
              ส
            </text>
            <text x="38" y="-18" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="'Prompt', sans-serif" textAnchor="middle">
              นิ
            </text>
            <text x="-34" y="24" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="'Prompt', sans-serif" textAnchor="middle">
              ทุ
            </text>
            <text x="34" y="24" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="'Prompt', sans-serif" textAnchor="middle">
              ม
            </text>
          </g>
        </svg>
      )}
    </div>
  );
};
