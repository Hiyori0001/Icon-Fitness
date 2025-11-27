import React from 'react';
import { MachineWithOriginalId } from "@/hooks/useMachines";
import PdfMachineItem from './PdfMachineItem';

interface PdfMachineRowProps {
  machines: MachineWithOriginalId[];
  includePrice: boolean;
}

const PdfMachineRow: React.FC<PdfMachineRowProps> = ({ machines, includePrice }) => {
  const numMachinesInRow = machines.length;
  const totalContentWidth = 515; // A4 width (595pt) - 2 * margin (40pt) = 515pt (approx 686px at 1pt=1.33px)
  const gapSize = 16; // Equivalent to Tailwind's gap-4 in pixels, roughly 12pt
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
      {/* Add empty divs to fill the row if there are fewer than 3 machines, maintaining layout */}
      {Array.from({ length: 3 - machines.length }).map((_, index) => (
        <div key={`empty-${index}`} style={{ width: itemWidth, marginRight: index < (3 - machines.length - 1) ? `${gapSize}px` : '0' }}></div>
      ))}
    </div>
  );
};

export default PdfMachineRow;