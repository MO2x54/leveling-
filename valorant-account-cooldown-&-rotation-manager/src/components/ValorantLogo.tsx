import React from 'react';

interface ValorantLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export const ValorantLogo: React.FC<ValorantLogoProps> = ({
  className = '',
  size = 24,
  color = '#FF4655',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0 10.6L36.8 89.4H58.4L21.6 10.6H0Z"
        fill={color}
      />
      <path
        d="M63.2 10.6H84.8L100 43.2H78.4L63.2 10.6Z"
        fill={color}
      />
    </svg>
  );
};
