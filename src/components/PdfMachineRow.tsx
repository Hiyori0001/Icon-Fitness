import React from 'react';
import { MachineWithOriginalId } from "@/hooks/useMachines";
import PdfMachineItem from './PdfMachineItem';

interface PdfMachineRowProps {
  machines: MachineWithOriginalId[];
  includePrice: boolean;
}

const PdfMachineRow: React.FC<PdfMachineRowProps> = ({ machines, includePrice }) => {
  const numMachinesInRow = machines.length;
  const gapSize = 16; // Equivalent to Tailwind's gap-4 in pixels
  const totalGapWidth = (numMachinesInRow > 1 ? (numMachinesInRow - 1) * gapSize : 0);
  const itemWidth = `calc((100% - ${totalGapWidth}px) / ${numMachinesInRow || 1})`;

  return (
    <div className="flex mb-4" style={{ width: '100%', pageBreakInside: 'avoid' }}>
      {machines.map((machine, index) => (
        <div
          key={machine.id}
          style={{
            width: itemWidth,
            marginRight: index < numMachinesInRow - 1 ? `${gapSize}px` : '0',
            flexShrink: 0, // Prevent items from shrinking
          }}
        >
          <PdfMachineItem machine={machine} includePrice={includePrice} />
        </div>
      ))}
      {/* No need for empty divs with this flex approach, as width is calculated per item */}
    </div>
  );
};

export default PdfMachineRow;