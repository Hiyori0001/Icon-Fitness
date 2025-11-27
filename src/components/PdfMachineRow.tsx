import React from 'react';
import { MachineWithOriginalId } from "@/hooks/useMachines";
import PdfMachineItem from './PdfMachineItem';

interface PdfMachineRowProps {
  machines: MachineWithOriginalId[];
  includePrice: boolean;
}

const PdfMachineRow: React.FC<PdfMachineRowProps> = ({ machines, includePrice }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4" style={{ width: '100%', pageBreakInside: 'avoid' }}>
      {machines.map((machine) => (
        <PdfMachineItem key={machine.id} machine={machine} includePrice={includePrice} />
      ))}
      {/* Add empty divs to fill the row if there are fewer than 3 machines */}
      {Array.from({ length: 3 - machines.length }).map((_, index) => (
        <div key={`empty-${index}`} className="flex-1"></div>
      ))}
    </div>
  );
};

export default PdfMachineRow;