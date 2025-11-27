"use client";

import React from 'react';
import { MachineWithOriginalId } from "@/hooks/useMachines";
import { formatCurrencyINR } from '@/utils/currency';

interface PdfBrochureItemProps {
  machine: MachineWithOriginalId;
  includePrice: boolean;
}

const PdfBrochureItem: React.FC<PdfBrochureItemProps> = ({ machine, includePrice }) => {
  return (
    <div
      className="flex flex-col border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white"
      style={{ pageBreakInside: 'avoid', height: '280px' }}
    >
      <div className="w-full h-32 flex-shrink-0 flex items-center justify-center bg-gray-100 p-2">
        <img src={machine.imageUrl} alt={machine.name} className="max-w-full max-h-full object-contain" />
      </div>
      <div className="p-3 flex-grow flex flex-col">
        <h3 className="text-base font-bold text-primary mb-1 leading-tight">{machine.name}</h3>
        <p className="text-xs text-gray-700 flex-grow mb-2 line-clamp-4" style={{ minHeight: '60px' }}>{machine.description}</p>
        {includePrice && (
          <p className="text-sm font-bold text-secondary-foreground mt-auto leading-tight">{formatCurrencyINR(machine.price)}</p>
        )}
      </div>
    </div>
  );
};

export default PdfBrochureItem;