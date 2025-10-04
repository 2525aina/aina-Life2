"use client";

import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  initialOpen: boolean;
  children: ReactNode;
}

export function CollapsibleSection({ title, initialOpen, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className="w-full">
      <div 
        className="flex items-center justify-between cursor-pointer py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-semibold">{title}</h3>
        {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </div>
      {isOpen && (
        <div className="pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
