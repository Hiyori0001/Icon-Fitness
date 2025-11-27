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
import PdfMachineRow from '@/components/PdfMachineRow'; // Import the new component
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BrochureGenerator = () => {
  const { allMachines, updateMachine, deleteMachine } = useMachines();
  const [selectedMachineIds, setSelectedMachineIds] = useState<Set<string>>(new Set());
  const [editingImageMachine, setEditingImageMachine] = useState<MachineWithOriginalId | null>(null);
  const [editingDetailsMachine, setEditingDetailsMachine] = useState<MachineWithOriginalId | null>(null);
  const [includePrice, setIncludePrice] = useState(true);
  const [customPriceInput, setCustomPriceInput] = useState<string>(''); // New state for custom price
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

    // Brochure Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor('#1a202c'); // Primary color
    doc.text("Icon Fitness Equipment Brochure", pageWidth / 2, yPos, { align: 'center' });
    yPos += 35;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor('#4a5568'); // Gray-700
    doc.text("Your Partner in Fitness Excellence", pageWidth / 2, yPos, { align: 'center' });
    yPos += 40;

    // Add a separator
    doc.setDrawColor('#e2e8f0'); // Border color
    doc.setLineWidth(1);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 20;

    // Group machines into rows of two
    const machineRows: MachineWithOriginalId[][] = [];
    for (let i = 0; i < selectedMachines.length; i += 2) {
      machineRows.push(selectedMachines.slice(i, i + 2));
    }

    // Iterate through machine rows and add them to the PDF
    for (const row of machineRows) {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px'; // Render off-screen
      tempDiv.style.width = `${pageWidth - 2 * margin}pt`; // Constrain width for accurate measurement
      document.body.appendChild(tempDiv);

      const root = createRoot(tempDiv);
      root.render(<PdfMachineRow machines={row} includePrice={includePrice} />);

      // Wait for React to render and images to load
      await new Promise(resolve => setTimeout(resolve, 100));

      const rowHeight = tempDiv.offsetHeight;
      const rowWidth = tempDiv.offsetWidth;

      // Check if the row fits on the current page
      if (yPos + rowHeight + margin > pageHeight) {
        doc.addPage();
        yPos = margin; // Reset Y position for new page
      }

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: rowWidth,
        height: rowHeight,
        backgroundColor: '#ffffff', // Ensure white background for canvas
      });
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', margin, yPos, rowWidth, rowHeight);

      yPos += rowHeight + 15; // Add spacing between rows

      root.unmount();
      document.body.removeChild(tempDiv);
    }

    // Add summary if prices are included or custom price is provided
    if (includePrice || (!includePrice && customPriceInput)) {
      doc.addPage(); // Always add summary on a new page
      yPos = margin;

      const summaryTempDiv = document.createElement('div');
      summaryTempDiv.style.position = 'absolute';
      summaryTempDiv.style.left = '-9999px';
      summaryTempDiv.style.width = `${pageWidth - 2 * margin}pt`;
      document.body.appendChild(summaryTempDiv);

      const summaryRoot = createRoot(summaryTempDiv);
      summaryRoot.render(
        <div className="p-6 bg-gray-100 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-primary mb-4">Selected Machines Summary</h2>
          {includePrice && selectedMachines.length > 0 && (
            <ul className="space-y-2 mb-4 text-gray-800">
              {selectedMachines.map(machine => (
                <li key={machine.id} className="flex justify-between items-center text-lg font-medium">
                  <span>{machine.name}</span>
                  <span>{formatCurrencyINR(machine.price)}</span>
                </li>
              ))}
            </ul>
          )}
          <Separator className="my-4 bg-gray-300" />
          {includePrice && selectedMachines.length > 0 && (
            <div className="flex justify-between items-center text-2xl font-bold text-primary">
              <span>Total Estimated Price:</span>
              <span>{formatCurrencyINR(totalPrice)}</span>
            </div>
          )}
          {!includePrice && customPriceInput && (
            <div className="flex justify-between items-center text-2xl font-bold text-primary">
              <span>Custom Total Price:</span>
              <span>{formatCurrencyINR(parseFloat(customPriceInput))}</span>
            </div>
          )}
          {!includePrice && !customPriceInput && (
            <p className="text-lg text-gray-600">No pricing information included.</p>
          )}
        </div>
      );

      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render

      const summaryHeight = summaryTempDiv.offsetHeight;
      const summaryWidth = summaryTempDiv.offsetWidth;

      const summaryCanvas = await html2canvas(summaryTempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: summaryWidth,
        height: summaryHeight,
        backgroundColor: '#ffffff',
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
              onClick={() => { setIncludePrice(true); setCustomPriceInput(''); }}
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

          {!includePrice && (
            <div className="mb-6 flex flex-col items-center">
              <Label htmlFor="custom-price" className="mb-2 text-lg font-medium">Add Custom Total Price (Optional)</Label>
              <Input
                id="custom-price"
                type="number"
                placeholder="e.g., 150000"
                value={customPriceInput}
                onChange={(e) => setCustomPriceInput(e.target.value)}
                className="w-full max-w-xs text-center"
              />
            </div>
          )}

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
              {!includePrice && customPriceInput && (
                <div className="flex justify-between items-center text-2xl font-bold text-primary">
                  <span>Custom Total Price:</span>
                  <span>{formatCurrencyINR(parseFloat(customPriceInput))}</span>
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