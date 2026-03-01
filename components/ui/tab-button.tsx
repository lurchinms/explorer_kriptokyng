import React from "react";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium transition-colors ${
        active 
          ? "text-primary border-b-2 border-primary" 
          : "text-muted-foreground border-b-2 border-transparent hover:text-primary hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}
