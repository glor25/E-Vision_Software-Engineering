import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ className = "", children, ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded font-medium transition duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
