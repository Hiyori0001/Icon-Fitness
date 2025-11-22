import * as React from 'react';
import { MachineWithOriginalId } from "@/hooks/useMachines";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrencyINR } from '@/utils/currency'; // Import the new utility

interface BrochureContentProps {
  machines: MachineWithOriginalId[];
  includePrice: boolean;
}

const BrochureContent: React.FC<BrochureContentProps> = ({ machines, includePrice }) => {
  const totalPrice = machines.reduce((sum, machine) => sum + machine.price, 0);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-primary mb-2">Icon Fitness Equipment Brochure</h1>
        <p className="text-xl text-gray-700">Your Partner in Fitness Excellence</p>
      </div>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <Card key={machine.id} className="flex flex-col overflow-hidden shadow-md">
            <CardHeader className="p-0">
              <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                <img src={machine.imageUrl} alt={machine.name} className="max-w-full max-h-full object-contain" />
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-xl font-bold mb-2">{machine.name}</CardTitle>
              <CardDescription className="text-gray-700 text-sm mb-3 font-bold">{machine.description}</CardDescription>
              {includePrice && (
                <p className="text-lg font-bold text-primary">{formatCurrencyINR(machine.price)}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {includePrice && machines.length > 0 && (
        <>
          <Separator className="my-8" />
          <div className="mt-10 p-6 bg-card rounded-lg shadow-md border">
            <h2 className="text-2xl font-bold text-secondary-foreground mb-4">Selected Machines Summary</h2>
            <ul className="space-y-2 mb-4">
              {machines.map(machine => (
                <li key={machine.id} className="flex justify-between items-center text-lg font-bold">
                  <span>{machine.name}</span>
                  <span>{formatCurrencyINR(machine.price)}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="flex justify-between items-center text-2xl font-bold text-primary">
              <span>Total Estimated Price:</span>
              <span>{formatCurrencyINR(totalPrice)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BrochureContent;