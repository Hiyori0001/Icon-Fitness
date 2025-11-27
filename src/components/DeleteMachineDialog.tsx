"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash } from 'lucide-react';
import { MachineWithOriginalId } from '@/hooks/useMachines';

interface DeleteMachineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  machine: MachineWithOriginalId;
  onConfirmDelete: (machineId: string, isCustomizedPredefined: boolean, isGlobal: boolean) => void; // Updated prop
}

const DeleteMachineDialog: React.FC<DeleteMachineDialogProps> = ({
  isOpen,
  onClose,
  machine,
  onConfirmDelete,
}) => {
  const isCustomizedPredefined = machine.original_machine_id !== undefined && machine.original_machine_id !== null;

  const handleDelete = () => {
    onConfirmDelete(machine.id, isCustomizedPredefined, machine.is_global || false); // Pass isGlobal
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
            {isCustomizedPredefined
              ? ` This will revert the custom changes made to "${machine.name}" back to its original predefined version.`
              : ` This will permanently delete the custom machine "${machine.name}".`}
            {machine.is_global && " This is a global machine, and deleting it will affect all users."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              {isCustomizedPredefined ? "Revert Customization" : "Delete Machine"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteMachineDialog;