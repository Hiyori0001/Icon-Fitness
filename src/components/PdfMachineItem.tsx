import React from 'react';
import { MachineWithOriginalId } from "@/hooks/useMachines";
import { formatCurrencyINR } from '@/utils/currency';

interface PdfMachineItemProps {
  machine: MachineWithOriginalId;
  includePrice: boolean;
}

const PdfMachineItem: React.FC<PdfMachineItemProps> = ({ machine, includePrice }) => {
  return (
    <div className="flex flex-col border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white h-full">
      <div className="w-full h-40 flex-shrink-0 flex items-center justify-center bg-gray-100 p-2">
        <img src={machine.imageUrl} alt={machine.name} className="max-w-full max-h-full object-contain" />
      </div>
      <div className="p-3 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-primary mb-1">{machine.name}</h3>
        <p className="text-sm text-gray-700 flex-grow mb-2">{machine.description}</p>
        {includePrice && (
          <p className="text-md font-bold text-secondary-foreground mt-auto">{formatCurrencyINR(machine.price)}</p>
        )}
      </div>
    </div>
  );
};

export default PdfMachineItem;