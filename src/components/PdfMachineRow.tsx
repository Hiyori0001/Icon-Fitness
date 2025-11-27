import React from 'react';
import { MachineWithOriginalId } from "@/hooks/useMachines";
import PdfMachineItem from './PdfMachineItem';

interface PdfMachineRowProps {
  machines: MachineWithOriginalId[];
  includePrice: boolean;
}

const PdfMachineRow: React.FC<PdfMachineRowProps> = ({ machines, includePrice }) => {
  const emptySlots = 3 - machines.length; // Now for 3 columns
  return (
    <div className="flex gap-4 mb-4" style={{ width: '100%', pageBreakInside: 'avoid' }}>
      {machines.map((machine) => (
        <div key={machine.id} className="flex-1">
          <PdfMachineItem machine={machine} includePrice={includePrice} />
        </div>
      ))}
      {/* Add empty divs to fill the row if there are fewer than 3 machines */}
      {Array.from({ length: emptySlots }).map((_, index) => (
        <div key={`empty-${index}`} className="flex-1"></div>
      ))}
    </div>
  );
};

export default PdfMachineRow;