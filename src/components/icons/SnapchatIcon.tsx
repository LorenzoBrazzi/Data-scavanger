
import React from "react";

interface SnapchatIconProps {
  className?: string;
}

export const SnapchatIcon: React.FC<SnapchatIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2c-2.76 0-5 2.24-5 5v3c0 .28-.22.5-.5.5s-.5-.22-.5-.5V9c0-.55-.45-1-1-1s-1 .45-1 1v1c0 1.1.9 2 2 2h.5c.28 0 .5.22.5.5v.5c0 .55.45 1 1 1h1c.55 0 1 .45 1 1s-.45 1-1 1h-1c-.55 0-1 .45-1 1s.45 1 1 1h1c.55 0 1 .45 1 1s-.45 1-1 1h-3c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1h-1c-.55 0-1-.45-1-1s.45-1 1-1h1c.55 0 1-.45 1-1s-.45-1-1-1h-1c-.55 0-1-.45-1-1s.45-1 1-1h1c.55 0 1-.45 1-1v-.5c0-.28.22-.5.5-.5h.5c1.1 0 2-.9 2-2V9c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .28-.22.5-.5.5s-.5-.22-.5-.5V7C17 4.24 14.76 2 12 2z" />
    </svg>
  );
};
