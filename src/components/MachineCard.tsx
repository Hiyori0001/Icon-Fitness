import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MachineWithOriginalId } from "@/hooks/useMachines"; // Use the extended interface
import { Button } from "@/components/ui/button";
import { Edit, Trash, Info } from 'lucide-react'; // Import Info icon
import { useAdmin } from '@/hooks/useAdmin';
import DeleteMachineDialog from './DeleteMachineDialog'; // Import the new dialog

interface MachineCardProps {
  machine: MachineWithOriginalId; // Use the extended interface
  isSelected: boolean;
  onSelect: (machineId: string, isSelected: boolean) => void;
  onEditImageClick: (machine: MachineWithOriginalId) => void;
  onEditDetailsClick: (machine: MachineWithOriginalId) => void; // New prop for editing details
  onDeleteMachine: (machineId: string, isCustomizedPredefined: boolean) => void;
}

const MachineCard: React.FC<MachineCardProps> = ({ machine, isSelected, onSelect, onEditImageClick, onEditDetailsClick, onDeleteMachine }) => {
  const { isAdmin } = useAdmin();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <Card className="flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="w-full h-48 flex items-center justify-center bg-gray-100">
          <img src={machine.imageUrl} alt={machine.name} className="max-w-full max-h-full object-contain" />
        </div>
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
        {isAdmin && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditDetailsClick(machine)} // New button for editing details
              title="Edit Machine Details"
            >
              <Info className="h-5 w-5 text-gray-500 hover:text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditImageClick(machine)}
              title="Edit Machine Image"
            >
              <Edit className="h-5 w-5 text-gray-500 hover:text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              title={machine.original_machine_id ? "Revert Customization" : "Delete Custom Machine"}
            >
              <Trash className="h-5 w-5 text-red-500 hover:text-red-700" />
            </Button>
          </div>
        )}
      </CardFooter>

      {isAdmin && showDeleteDialog && (
        <DeleteMachineDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          machine={machine}
          onConfirmDelete={onDeleteMachine}
        />
      )}
    </Card>
  );
};

export default MachineCard;