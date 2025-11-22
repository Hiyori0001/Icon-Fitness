"use client";

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot for dynamic rendering
import { MachineWithOriginalId } from "@/hooks/useMachines";
import MachineCard from "@/components/MachineCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from "sonner";
import { useMachines } from "@/hooks/useMachines";
import EditMachineImageDialog from "@/components/EditMachineImageDialog";
import EditMachineDetailsDialog from "@/components/EditMachineDetailsDialog";
import { useAdmin } from '@/hooks/useAdmin';
import BrochureContent from '@/components/BrochureContent'; // Import the new component

const BrochureGenerator = () => {
  const { allMachines, updateMachine, deleteMachine } = useMachines();
  const [selectedMachineIds, setSelectedMachineIds] = useState<Set<string>>(new Set());
  const [editingImageMachine, setEditingImageMachine] = useState<MachineWithOriginalId | null>(null);
  const [editingDetailsMachine, setEditingDetailsMachine] = useState<MachineWithOriginalId | null>(null);
  const [includePrice, setIncludePrice] = useState(true); // New state for price option
  const { isAdmin } = useAdmin();

  const handleSelectMachine = (machineId: string, isSelected: boolean) => {
    setSelectedMachineIds(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(machineId);
      } else {
        newSet.delete(machineId);
      }
      return newSet;
    });
  };

  const handleEditImageClick = (machine: MachineWithOriginalId) => {
    if (isAdmin) {
      setEditingImageMachine(machine);
    } else {
      toast.error("You do not have permission to edit machine images.");
    }
  };

  const handleSaveImage = (machineId: string, newImageUrl: string) => {
    updateMachine(machineId, { imageUrl: newImageUrl });
    setEditingImageMachine(null);
  };

  const handleEditDetailsClick = (machine: MachineWithOriginalId) => {
    if (isAdmin) {
      setEditingDetailsMachine(machine);
    } else {
      toast.error("You do not have permission to edit machine details.");
    }
  };

  const handleSaveDetails = (machineId: string, updates: { name?: string; description?: string; price?: number }) => {
    updateMachine(machineId, updates);
    setEditingDetailsMachine(null);
  };

  const handleDeleteMachine = (machineId: string, isCustomizedPredefined: boolean) => {
    deleteMachine(machineId, isCustomizedPredefined);
    setSelectedMachineIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(machineId);
      return newSet;
    });
  };

  const selectedMachines = allMachines.filter(machine => selectedMachineIds.has(machine.id));
  const totalPrice = selectedMachines.reduce((sum, machine) => sum + machine.price, 0);

  const generatePdf = async () => {
    if (selectedMachines.length === 0) {
      toast.error("Please select at least one machine to generate a brochure.");
      return;
    }

    toast.loading("Generating brochure...", { id: "pdf-gen" });

    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Create a temporary div to render the BrochureContent component off-screen
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = `${pageWidth}pt`; // Set width to match PDF page width
    document.body.appendChild(tempDiv);

    // Render the BrochureContent component into the temporary div using createRoot
    const root = createRoot(tempDiv);
    root.render(
      <BrochureContent machines={selectedMachines} includePrice={includePrice} />
    );

    // Give React a moment to render and for styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(tempDiv, {
      scale: 2, // Increase scale for better quality
      useCORS: true, // Crucial for loading cross-origin images
      allowTaint: true, // Allows loading images from other origins without tainting the canvas
    });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add the first page
    doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    heightLeft -= (pageHeight - margin);

    // Add subsequent pages if content overflows
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Clean up the temporary div and React root
    root.unmount();
    document.body.removeChild(tempDiv);

    doc.save('IconFitness_Brochure.pdf');
    toast.success("Brochure generated successfully!", { id: "pdf-gen" });
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Generate Your Custom Brochure</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg text-gray-700 mb-6">
            Select the gym equipment you'd like to include in your personalized brochure.
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={() => setIncludePrice(true)}
              variant={includePrice ? "default" : "outline"}
              className="px-6 py-2"
            >
              With Price
            </Button>
            <Button
              onClick={() => setIncludePrice(false)}
              variant={!includePrice ? "default" : "outline"}
              className="px-6 py-2"
            >
              Without Price
            </Button>
          </div>
          <div className="flex justify-center mb-6">
            <Button onClick={generatePdf} className="px-8 py-3 text-lg">
              Generate Brochure ({selectedMachines.length} items)
            </Button>
          </div>
          <Separator className="my-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allMachines.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                isSelected={selectedMachineIds.has(machine.id)}
                onSelect={handleSelectMachine}
                onEditImageClick={handleEditImageClick}
                onEditDetailsClick={handleEditDetailsClick}
                onDeleteMachine={handleDeleteMachine}
              />
            ))}
          </div>
          {selectedMachines.length > 0 && (
            <div className="mt-10 p-6 bg-card rounded-lg shadow-md border">
              <h2 className="text-2xl font-bold text-secondary-foreground mb-4">Selected Machines Summary</h2>
              <ul className="space-y-2 mb-4">
                {selectedMachines.map(machine => (
                  <li key={machine.id} className="flex justify-between items-center text-lg">
                    <span>{machine.name}</span>
                    {includePrice && <span className="font-semibold">${machine.price.toLocaleString()}</span>}
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              {includePrice && (
                <div className="flex justify-between items-center text-2xl font-bold text-primary">
                  <span>Total Estimated Price:</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {editingImageMachine && (
        <EditMachineImageDialog
          isOpen={!!editingImageMachine}
          onClose={() => setEditingImageMachine(null)}
          machine={editingImageMachine}
          onSave={handleSaveImage}
        />
      )}

      {editingDetailsMachine && (
        <EditMachineDetailsDialog
          isOpen={!!editingDetailsMachine}
          onClose={() => setEditingDetailsMachine(null)}
          machine={editingDetailsMachine}
          onSave={handleSaveDetails}
        />
      )}
    </div>
  );
};

export default BrochureGenerator;