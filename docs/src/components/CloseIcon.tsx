import React from 'react';

interface Props {
  size?: number;
  color?: string;
}

export const CloseIcon: React.FC<Props> = ({ size = 24, color = 'currentColor' }) => {
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
      className="feather feather-x-circle"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M15 9l-6 6m0-6l6 6"></path>
    </svg>
  );
};
