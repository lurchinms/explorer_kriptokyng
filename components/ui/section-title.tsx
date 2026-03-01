import React from "react";

interface SectionTitleProps {
  title: string;
}

export function SectionTitle({ title }: SectionTitleProps) {
  return (
    <h2 className="text-2xl font-bold mb-6">{title}</h2>
  );
}
