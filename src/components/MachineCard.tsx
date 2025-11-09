import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Machine } from "@/data/machines";

interface MachineCardProps {
  machine: Machine;
  isSelected: boolean;
  onSelect: (machineId: string, isSelected: boolean) => void;
}

const MachineCard: React.FC<MachineCardProps> = ({ machine, isSelected, onSelect }) => {
  return (
    <Card className="flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <img src={machine.imageUrl} alt={machine.name} className="w-full h-48 object-cover" />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-semibold mb-2">{machine.name}</CardTitle>
        <CardDescription className="text-gray-600 text-sm mb-3 line-clamp-3">{machine.description}</CardDescription>
        <p className="text-lg font-bold text-primary">${machine.price.toLocaleString()}</p>
      </CardContent>
      <CardFooter className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`machine-${machine.id}`}
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(machine.id, checked as boolean)}
          />
          <label
            htmlFor={`machine-${machine.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select for Brochure
          </label>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MachineCard;