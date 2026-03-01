import React from "react";

interface StatProps {
  title: string;
  value: string | number;
  className?: string;
}

export function Stat({ title, value, className = "" }: StatProps) {
  return (
    <div className={`bg-muted/30 p-6 rounded-lg border ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
