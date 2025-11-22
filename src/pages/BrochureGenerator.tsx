"use client";

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
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
import BrochureContent from '@/components/BrochureContent';
import { formatCurrencyINR } from '@/utils/currency';
import PdfMachineItem from '@/components/PdfMachineItem'; // Import the new component

const BrochureGenerator = () => {
  const { allMachines, updateMachine, deleteMachine } = useMachines();
  const [selectedMachineIds, setSelectedMachineIds] = useState<Set<string>>(new Set());
  const [editingImageMachine, setEditingImageMachine] = useState<MachineWithOriginalId | null>(null);
  const [editingDetailsMachine, setEditingDetailsMachine] = useState<MachineWithOriginalId | null>(null);
  const [includePrice, setIncludePrice] = useState(true);
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
    let yPos = margin; // Current Y position on the page

    // Add brochure title and description to the first page
    doc.setFontSize(24);
    doc.text("Icon Fitness Equipment Brochure", pageWidth / 2, yPos, { align: 'center' });
    yPos += 30;
    doc.setFontSize(14);
    doc.text("Your Partner in Fitness Excellence", pageWidth / 2, yPos, { align: 'center' });
    yPos += 40; // Space after title/description

    // Add a separator
    doc.setDrawColor(200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 20;

    // Iterate through selected machines and add them to the PDF
    for (const machine of selectedMachines) {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px'; // Render off-screen
      tempDiv.style.width = `${pageWidth - 2 * margin}pt`; // Constrain width for accurate measurement
      document.body.appendChild(tempDiv);

      const root = createRoot(tempDiv);
      root.render(<PdfMachineItem machine={machine} includePrice={includePrice} />);

      // Wait for React to render and images to load
      await new Promise(resolve => setTimeout(resolve, 100));

      const cardHeight = tempDiv.offsetHeight;
      const cardWidth = tempDiv.offsetWidth;

      // Check if the card fits on the current page
      if (yPos + cardHeight + margin > pageHeight) {
        doc.addPage();
        yPos = margin; // Reset Y position for new page
      }

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: cardWidth,
        height: cardHeight,
      });
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', margin, yPos, cardWidth, cardHeight);

      yPos += cardHeight + 10; // Add spacing between cards

      root.unmount();
      document.body.removeChild(tempDiv);
    }

    // Add summary if prices are included and there are selected machines
    if (includePrice && selectedMachines.length > 0) {
      const summaryTempDiv = document.createElement('div');
      summaryTempDiv.style.position = 'absolute';
      summaryTempDiv.style.left = '-9999px';
      summaryTempDiv.style.width = `${pageWidth - 2 * margin}pt`;
      document.body.appendChild(summaryTempDiv);

      const summaryRoot = createRoot(summaryTempDiv);
      summaryRoot.render(
        <div className="p-6 bg-card rounded-lg shadow-md border">
          <h2 className="text-2xl font-bold text-secondary-foreground mb-4">Selected Machines Summary</h2>
          <ul className="space-y-2 mb-4">
            {selectedMachines.map(machine => (
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
      );

      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render

      const summaryHeight = summaryTempDiv.offsetHeight;
      const summaryWidth = summaryTempDiv.offsetWidth;

      if (yPos + summaryHeight + margin > pageHeight) {
        doc.addPage();
        yPos = margin;
      }

      const summaryCanvas = await html2canvas(summaryTempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: summaryWidth,
        height: summaryHeight,
      });
      const summaryImgData = summaryCanvas.toDataURL('image/png');
      doc.addImage(summaryImgData, 'PNG', margin, yPos, summaryWidth, summaryHeight);

      summaryRoot.unmount();
      document.body.removeChild(summaryTempDiv);
    }

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
                    {includePrice && <span className="font-semibold">{formatCurrencyINR(machine.price)}</span>}
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              {includePrice && (
                <div className="flex justify-between items-center text-2xl font-bold text-primary">
                  <span>Total Estimated Price:</span>
                  <span>{formatCurrencyINR(totalPrice)}</span>
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