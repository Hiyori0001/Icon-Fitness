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
import PdfMachineRow from '@/components/PdfMachineRow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BrochureGenerator = () => {
  const { allMachines, updateMachine, deleteMachine } = useMachines();
  const [selectedMachineIds, setSelectedMachineIds] = useState<Set<string>>(new Set());
  const [editingImageMachine, setEditingImageMachine] = useState<MachineWithOriginalId | null>(null);
  const [editingDetailsMachine, setEditingDetailsMachine] = useState<MachineWithOriginalId | null>(null);
  const [includePrice, setIncludePrice] = useState(true);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
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

  const isAllSelected = allMachines.length > 0 && selectedMachineIds.size === allMachines.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedMachineIds(new Set());
    } else {
      setSelectedMachineIds(new Set(allMachines.map(machine => machine.id)));
    }
  };

  const generatePdf = async () => {
    if (selectedMachines.length === 0) {
      toast.error("Please select at least one machine to generate a brochure.");
      return;
    }

    if (!includePrice && (!customPriceInput || isNaN(parseFloat(customPriceInput)))) {
      toast.error("Please enter an estimated total amount when not including individual prices.");
      return;
    }

    toast.loading("Generating brochure...", { id: "pdf-gen" });

    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt for A4
    const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt for A4
    let yPos = margin; // Current Y position on the page
    let rowsRenderedOnCurrentPage = 0;
    const maxRowsPerPage = 3; // Max 3 rows per page (3 machines/row * 3 rows = 9 machines)

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

    // Group machines into rows of three
    const machineRows: MachineWithOriginalId[][] = [];
    for (let i = 0; i < selectedMachines.length; i += 3) {
      machineRows.push(selectedMachines.slice(i, i + 3));
    }

    // Iterate through machine rows and add them to the PDF
    for (const row of machineRows) {
      // Check if a new page is needed before rendering the current row
      // Assuming each row takes approx 300pt height (280px item height + padding/margin)
      const estimatedRowHeight = 300; // Estimate height of a PdfMachineRow
      if (yPos + estimatedRowHeight > pageHeight - margin) { // Check if row will fit
        doc.addPage();
        yPos = margin; // Reset Y position for new page
        rowsRenderedOnCurrentPage = 0; // Reset row counter for new page
      }

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px'; // Render off-screen
      const contentWidth = pageWidth - 2 * margin; // Available width for content in pt
      tempDiv.style.width = `${contentWidth}pt`; // Set width in pt for html2canvas
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.style.padding = '0';
      tempDiv.style.margin = '0';
      tempDiv.style.overflow = 'hidden';
      document.body.appendChild(tempDiv);

      const root = createRoot(tempDiv);
      root.render(<PdfMachineRow machines={row} includePrice={includePrice} />);

      await new Promise(resolve => setTimeout(resolve, 500)); // Increased timeout for stability

      const renderedHeight = tempDiv.offsetHeight; // Get actual rendered height in px

      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Render at higher resolution
        useCORS: true,
        allowTaint: true,
        width: contentWidth * (96 / 72), // Convert pt to px for html2canvas width (approx 96px per 72pt)
        height: renderedHeight,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = contentWidth; // Use contentWidth for PDF image width
      const imgHeight = (canvas.height / canvas.width) * imgWidth; // Maintain aspect ratio

      doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);

      yPos += imgHeight + 15; // Add spacing between rows
      rowsRenderedOnCurrentPage++;

      root.unmount();
      document.body.removeChild(tempDiv);
    }

    // Add summary if prices are included or custom price is provided
    if (includePrice || customPriceInput) {
      doc.addPage(); // Always add summary on a new page
      yPos = margin;

      const summaryTempDiv = document.createElement('div');
      summaryTempDiv.style.position = 'absolute';
      summaryTempDiv.style.left = '-9999px';
      const contentWidth = pageWidth - 2 * margin;
      summaryTempDiv.style.width = `${contentWidth}pt`;
      summaryTempDiv.style.boxSizing = 'border-box';
      summaryTempDiv.style.padding = '0';
      summaryTempDiv.style.margin = '0';
      summaryTempDiv.style.overflow = 'hidden';
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
              <span>Estimated Total Amount:</span>
              <span>{formatCurrencyINR(parseFloat(customPriceInput))}</span>
            </div>
          )}
        </div>
      );

      await new Promise(resolve => setTimeout(resolve, 500)); // Increased timeout for stability

      const summaryRenderedHeight = summaryTempDiv.offsetHeight;
      const summaryCanvas = await html2canvas(summaryTempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: contentWidth * (96 / 72), // Convert pt to px for html2canvas width
        height: summaryRenderedHeight,
        backgroundColor: '#ffffff',
      });
      const summaryImgData = summaryCanvas.toDataURL('image/png');

      const summaryImgWidth = contentWidth;
      const summaryImgHeight = (summaryCanvas.height / summaryCanvas.width) * summaryImgWidth;

      doc.addImage(summaryImgData, 'PNG', margin, yPos, summaryImgWidth, summaryImgHeight);

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
          
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleSelectAllToggle}
              variant="outline"
              className="px-6 py-2"
            >
              {isAllSelected ? "Deselect All" : "Select All"}
            </Button>
          </div>

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
                  <span>Estimated Total Amount:</span>
                  <span>{formatCurrencyINR(parseFloat(customPriceInput))}</span>
                </div>
              )}
            </div>
          )}

          <Separator className="my-8" /> {/* Separator before controls */}

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
              <Label htmlFor="custom-price" className="mb-2 text-lg font-medium">Estimated total amount</Label>
              <Input
                id="custom-price"
                type="number"
                placeholder="e.g., 150000"
                value={customPriceInput}
                onChange={(e) => setCustomPriceInput(e.target.value)}
                className="w-full max-w-xs text-center"
                required={!includePrice} // Make it required
              />
            </div>
          )}

          <div className="flex justify-center mb-6">
            <Button onClick={generatePdf} className="px-8 py-3 text-lg">
              Generate Brochure ({selectedMachines.length} items)
            </Button>
          </div>

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