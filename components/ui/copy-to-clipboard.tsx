"use client";

import * as React from "react";
import { Check } from "lucide-react";

interface CopyToClipboardProps {
  value: string;
  children: React.ReactElement;
}

export function CopyToClipboard({ value, children }: CopyToClipboardProps) {
  const [copied, setCopied] = React.useState(false);
  
  const copy = () => {
    if (!navigator.clipboard) {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      
      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
      
      document.body.removeChild(textArea);
      return;
    }
    
    navigator.clipboard.writeText(value).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Failed to copy: ', err);
      }
    );
  };

  // Fix the TypeScript error by ensuring props is an object type
  const childrenProps = children.props as Record<string, unknown>;
  
  // Create new props for the cloned element with proper typing
  const childProps = {
    ...(childrenProps || {}), // Apply type assertion and fallback
    onClick: copy,
    className: `${childrenProps?.className || ''} ${copied ? 'opacity-80' : ''}`,
  };

  return (
    <div className="relative">
      {React.cloneElement(children, childProps)}
      {copied && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          <Check className="h-3 w-3 text-green-500" />
        </span>
      )}
    </div>
  );
}