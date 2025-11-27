import React from 'react';
import { MachineWithOriginalId } from "@/hooks/useMachines";
import PdfMachineItem from './PdfMachineItem';

interface PdfMachineRowProps {
  machines: MachineWithOriginalId[];
  includePrice: boolean;
}

const PdfMachineRow: React.FC<PdfMachineRowProps> = ({ machines, includePrice }) => {
  return (
    <div className="flex gap-4 mb-4" style={{ width: '100%', pageBreakInside: 'avoid' }}>
      {machines.map((machine, index) => (
        <div key={machine.id} className="flex-1">
          <PdfMachineItem machine={machine} includePrice={includePrice} />
        </div>
      ))}
      {/* If only one machine in the row, add an empty div to maintain layout */}
      {machines.length === 1 && <div className="flex-1"></div>}
    </div>
  );
};

export default PdfMachineRow;