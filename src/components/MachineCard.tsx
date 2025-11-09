import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Machine } from "@/data/machines";
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';

interface MachineCardProps {
  machine: Machine;
  isSelected: boolean;
  onSelect: (machineId: string, isSelected: boolean) => void;
  onEditImageClick: (machine: Machine) => void;
}

const MachineCard: React.FC<MachineCardProps> = ({ machine, isSelected, onSelect, onEditImageClick }) => {
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEditImageClick(machine)}
          className="ml-2"
          title="Edit Machine Image"
        >
          <Edit className="h-5 w-5 text-gray-500 hover:text-primary" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MachineCard;