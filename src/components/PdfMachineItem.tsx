import React from 'react';
import { MachineWithOriginalId } from "@/hooks/useMachines";
import { formatCurrencyINR } from '@/utils/currency';

interface PdfMachineItemProps {
  machine: MachineWithOriginalId;
  includePrice: boolean;
}

const PdfMachineItem: React.FC<PdfMachineItemProps> = ({ machine, includePrice }) => {
  return (
    <div className="flex border rounded-lg overflow-hidden shadow-sm mb-4 bg-white" style={{ width: '100%', pageBreakInside: 'avoid' }}>
      <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-gray-100 p-2">
        <img src={machine.imageUrl} alt={machine.name} className="max-w-full max-h-full object-contain" />
      </div>
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-bold mb-1">{machine.name}</h3>
        <p className="text-sm text-gray-700 mb-2">{machine.description}</p>
        {includePrice && (
          <p className="text-md font-bold text-primary">{formatCurrencyINR(machine.price)}</p>
        )}
      </div>
    </div>
  );
};

export default PdfMachineItem;