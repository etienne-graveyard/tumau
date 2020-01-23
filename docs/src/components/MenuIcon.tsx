import React from 'react';

interface Props {
  size?: number;
  color?: string;
}

export const MenuIcon: React.FC<Props> = ({ size = 24, color = 'currentColor' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className="feather feather-menu"
      viewBox="0 0 24 24"
    >
      <path d="M3 12h18M3 6h18M3 18h18"></path>
    </svg>
  );
};
